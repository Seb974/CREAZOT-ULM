<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Entity\FlightRule;
use App\Entity\PreFlightAnalysis;
use App\Entity\User;
use App\Repository\NotamCacheRepository;
use App\Repository\SiteSettingsRepository;
use App\Service\KimiAiService;
use App\Service\ScoreOpsService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[IsGranted('ROLE_USER')]
class ScoreOpsController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ScoreOpsService $scoreOps,
        private KimiAiService $kimiAi,
        private HttpClientInterface $httpClient,
        private NotamCacheRepository $notamCacheRepo,
        private SiteSettingsRepository $siteSettingsRepo,
        private LoggerInterface $logger,
    ) {}

    #[Route('/admin/score-ops/{icao}', name: 'score_ops_analyze', methods: ['GET'])]
    public function analyze(string $icao, Request $request): JsonResponse
    {
        $icao = strtoupper(trim($icao));

        $clientId = $request->headers->get('X-Client-Id');
        if (!$clientId) {
            return new JsonResponse(['error' => 'X-Client-Id requis'], 400);
        }

        $client = $this->em->getRepository(Client::class)->find((int) $clientId);
        if (!$client) {
            return new JsonResponse(['error' => 'Client introuvable'], 404);
        }

        $rule = $this->em->getRepository(FlightRule::class)->findOneBy(['client' => $client]);
        if (!$rule) {
            return new JsonResponse([
                'result' => 'no_rules',
                'message' => 'Aucune règle de vol configurée pour ce club. Contactez votre administrateur.',
            ]);
        }

        $metar = $this->fetchMetar($icao);
        $allNotams = $this->fetchNotams($icao);
        $notams = $this->filterActiveNotams($allNotams);
        $tafData = $this->fetchTafFull($icao);

        if (empty($metar)) {
            return new JsonResponse([
                'result' => 'no_data',
                'message' => 'Impossible de récupérer les données METAR pour ' . $icao,
            ]);
        }

        $context = [
            'lat' => $client->getLat(),
            'lng' => $client->getLng(),
            'timezone' => $client->getTimezone() ?? 'UTC',
            'taf_fcsts' => $tafData['fcsts'] ?? null,
        ];

        if ($rule->getNotamStrategy() === 'ai' && !empty($notams)) {
            $cachedNotam = $this->notamCacheRepo->findFresh($icao);
            $cachedAi = $cachedNotam?->getAiAnalysis();

            if ($cachedAi !== null && !isset($cachedAi['error'])) {
                $this->logger->debug('ScoreOps NOTAM AI cache hit', ['icao' => $icao]);
                $context['notam_analysis'] = $cachedAi;
            } else {
                try {
                    $aiResult = $this->kimiAi->classifyNotams($notams, $icao);
                    $context['notam_analysis'] = $aiResult;

                    if ($cachedNotam) {
                        $cachedNotam->setAiAnalysis($aiResult);
                        $this->em->flush();
                        $this->logger->info('ScoreOps NOTAM AI analysis cached', ['icao' => $icao]);
                    }
                } catch (\Throwable $e) {
                    $this->logger->warning('NOTAM AI classification failed, fallback to warn', ['error' => $e->getMessage()]);
                    $context['notam_analysis'] = null;
                }
            }
        }

        $evaluation = $this->scoreOps->evaluate($metar, $notams, $rule, $context);

        return new JsonResponse([
            'result' => $evaluation['result'],
            'checks' => $evaluation['checks'],
            'conditions' => $evaluation['conditions'],
            'metar_raw' => $metar['raw_text'] ?? null,
            'taf_raw' => $tafData['raw_text'] ?? null,
            'notam_count' => count($notams),
            'notam_total' => count($allNotams),
            'rule_name' => $rule->getName(),
            'icao' => $icao,
            'disclaimer' => "Cet outil fournit une aide à la décision basée sur les paramètres définis par l'exploitant. Le commandant de bord reste seul décisionnaire.",
        ]);
    }

    /**
     * Filter NOTAMs to keep only those active right now.
     */
    private function filterActiveNotams(array $notams): array
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));

        return array_values(array_filter($notams, function (array $notam) use ($now) {
            $start = $notam['startDate'] ?? null;
            $end = $notam['endDate'] ?? null;

            if ($start !== null) {
                try {
                    $startDt = new \DateTimeImmutable($start);
                    if ($now < $startDt) {
                        return false;
                    }
                } catch (\Throwable) {}
            }

            if ($end !== null) {
                try {
                    $endDt = new \DateTimeImmutable($end);
                    if ($now > $endDt) {
                        return false;
                    }
                } catch (\Throwable) {}
            }

            return true;
        }));
    }

    #[Route('/admin/score-ops/{icao}/save', name: 'score_ops_save', methods: ['POST'])]
    public function save(string $icao, Request $request): JsonResponse
    {
        $clientId = $request->headers->get('X-Client-Id');
        $client = $this->em->getRepository(Client::class)->find((int) $clientId);
        $user = $this->getUser();

        if (!$client || !$user instanceof User) {
            return new JsonResponse(['error' => 'Données invalides'], 400);
        }

        $data = json_decode($request->getContent(), true);

        $analysis = new PreFlightAnalysis();
        $analysis->setClient($client);
        $analysis->setPilot($user);
        $analysis->setIcaoCode(strtoupper(trim($icao)));
        $analysis->setResult($data['result'] ?? 'go');
        $analysis->setDetails($data['checks'] ?? []);
        $analysis->setMetarRaw($data['metar_raw'] ?? null);
        $analysis->setTafRaw($data['taf_raw'] ?? null);
        $analysis->setNotamCount($data['notam_count'] ?? 0);

        $this->em->persist($analysis);
        $this->em->flush();

        return new JsonResponse(['success' => true, 'id' => $analysis->getId()]);
    }

    private function fetchMetar(string $icao): array
    {
        try {
            $url = 'https://aviationweather.gov/api/data/metar?ids=' . $icao . '&format=json';
            $response = $this->httpClient->request('GET', $url, ['timeout' => 10]);
            $data = $response->toArray(false);
            if (!empty($data) && is_array($data) && isset($data[0])) {
                return [
                    'raw_text' => $data[0]['rawOb'] ?? '',
                    'wind' => [
                        'speed_kts' => $data[0]['wspd'] ?? 0,
                        'gust_kts' => $data[0]['wgst'] ?? null,
                        'degrees' => $data[0]['wdir'] ?? 0,
                    ],
                    'visibility' => [
                        'meters_float' => isset($data[0]['visib']) && is_numeric($data[0]['visib'])
                            ? (float) $data[0]['visib'] * 1609.34
                            : 9999,
                    ],
                    'clouds' => array_map(fn($c) => [
                        'code' => $c['cover'] ?? '',
                        'base_feet_agl' => $c['base'] ?? 0,
                    ], $data[0]['clouds'] ?? []),
                    'temperature' => ['celsius' => $data[0]['temp'] ?? null],
                    'barometer' => ['hpa' => $data[0]['altim'] ?? null],
                ];
            }
        } catch (\Throwable $e) {
            $this->logger->error('ScoreOps METAR fetch error', ['icao' => $icao, 'error' => $e->getMessage()]);
        }
        return [];
    }

    private function fetchTafFull(string $icao): array
    {
        try {
            $url = 'https://aviationweather.gov/api/data/taf?ids=' . $icao . '&format=json';
            $response = $this->httpClient->request('GET', $url, ['timeout' => 10]);
            $data = $response->toArray(false);
            if (!empty($data) && is_array($data) && isset($data[0])) {
                return [
                    'raw_text' => $data[0]['rawTAF'] ?? '',
                    'fcsts' => $data[0]['fcsts'] ?? [],
                ];
            }
        } catch (\Throwable $e) {
            $this->logger->error('ScoreOps TAF fetch error', ['icao' => $icao, 'error' => $e->getMessage()]);
        }
        return [];
    }

    private function fetchNotams(string $icao): array
    {
        $cached = $this->notamCacheRepo->findFresh($icao);
        if ($cached) {
            $this->logger->debug('ScoreOps NOTAM cache hit', ['icao' => $icao]);
            return $cached->getData();
        }

        $settings = $this->siteSettingsRepo->findInstance();
        $apiKey = $settings?->getNotamifyApiKey();

        if (!$apiKey) {
            $stale = $this->notamCacheRepo->find(strtoupper(trim($icao)));
            if ($stale) {
                return $stale->getData();
            }
            return [];
        }

        try {
            $response = $this->httpClient->request('GET', 'https://api.notamify.com/api/v2/notams', [
                'timeout' => 15,
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Accept' => 'application/json',
                ],
                'query' => [
                    'location' => $icao,
                    'per_page' => 30,
                ],
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 400) {
                $stale = $this->notamCacheRepo->find(strtoupper(trim($icao)));
                return $stale ? $stale->getData() : [];
            }

            $content = $response->getContent(false);
            $data = json_decode($content, true);
            $notams = $data['notams'] ?? [];

            $normalized = array_map(function (array $item) use ($icao) {
                $qcode = $item['qcode'] ?? '';
                $typeChar = strlen($qcode) >= 2 ? $qcode[1] : null;
                return [
                    'id'        => $item['notam_number'] ?? $item['id'] ?? null,
                    'raw'       => $item['icao_message'] ?? $item['message'] ?? null,
                    'body'      => $item['message'] ?? null,
                    'type'      => $typeChar,
                    'startDate' => $item['starts_at'] ?? null,
                    'endDate'   => $item['ends_at'] ?? null,
                    'location'  => $item['location'] ?? $icao,
                    'qualifiers' => ['subject' => $typeChar],
                ];
            }, $notams);

            $this->notamCacheRepo->upsert($icao, $normalized);

            return $normalized;
        } catch (\Throwable $e) {
            $this->logger->error('ScoreOps NOTAM API error', ['icao' => $icao, 'error' => $e->getMessage()]);
            $stale = $this->notamCacheRepo->find(strtoupper(trim($icao)));
            return $stale ? $stale->getData() : [];
        }
    }
}
