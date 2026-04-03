<?php

namespace App\Controller;

use App\Repository\IcaoReferenceRepository;
use App\Repository\NotamCacheRepository;
use App\Repository\SiteSettingsRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[IsGranted('ROLE_USER')]
class WeatherProxyController extends AbstractController
{
    private const NOAA_BASE = 'https://aviationweather.gov/api/data';
    private const NOTAMIFY_BASE = 'https://api.notamify.com/api/v2/notams';

    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
        private LoggerInterface $logger,
    ) {}

    #[Route('/admin/weather/{type}/{icao}', name: 'weather_proxy', methods: ['GET'], requirements: ['type' => 'metar|taf'])]
    public function getWeather(string $type, string $icao): JsonResponse
    {
        $icao = strtoupper(trim($icao));
        $url = sprintf('%s/%s?ids=%s&format=json', self::NOAA_BASE, $type, $icao);

        try {
            $response = $this->httpClient->request('GET', $url, ['timeout' => 10]);
            $content = $response->getContent(false);

            if (empty(trim($content))) {
                return $this->json(['results' => 0, 'data' => []], 200);
            }

            $noaaData = json_decode($content, true);

            if (!is_array($noaaData) || empty($noaaData)) {
                return $this->json(['results' => 0, 'data' => []], 200);
            }

            $normalized = $type === 'metar'
                ? $this->normalizeMetar($noaaData)
                : $this->normalizeTaf($noaaData);

            return $this->json(['results' => count($normalized), 'data' => $normalized], 200);
        } catch (\Throwable $e) {
            return $this->json(['results' => 0, 'data' => [], 'error' => $e->getMessage()], 502);
        }
    }

    #[Route('/admin/weather/notam/{icao}', name: 'weather_notam_proxy', methods: ['GET'])]
    public function getNotams(
        string $icao,
        NotamCacheRepository $cacheRepo,
        IcaoReferenceRepository $icaoRepo,
    ): JsonResponse {
        $icao = strtoupper(trim($icao));

        if (!$icaoRepo->isValid($icao)) {
            $this->logger->debug('NOTAM skipped: not a known ICAO', ['code' => $icao]);
            return $this->json([], 200);
        }

        $cached = $cacheRepo->findFresh($icao);
        if ($cached) {
            $this->logger->debug('NOTAM cache hit', ['icao' => $icao]);
            return $this->json($cached->getData(), 200);
        }

        $settings = $this->siteSettingsRepo->findInstance();
        $apiKey = $settings?->getNotamifyApiKey();

        if (!$apiKey) {
            return $this->json([
                'error' => 'Clé API Notamify non configurée. Rendez-vous dans Paramétrage SaaS pour la renseigner.',
            ], 422);
        }

        try {
            $response = $this->httpClient->request('GET', self::NOTAMIFY_BASE, [
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
            $content = $response->getContent(false);

            if ($statusCode === 401 || $statusCode === 403) {
                return $this->json([
                    'error' => 'Clé API Notamify invalide ou expirée. Vérifiez-la dans Paramétrage SaaS.',
                ], 422);
            }

            if (empty(trim($content))) {
                $cacheRepo->upsert($icao, []);
                return $this->json([], 200);
            }

            $data = json_decode($content, true);

            if (!is_array($data)) {
                $cacheRepo->upsert($icao, []);
                return $this->json([], 200);
            }

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
                    'qualifiers' => [
                        'subject' => $typeChar,
                    ],
                ];
            }, $notams);

            $cacheRepo->upsert($icao, $normalized);
            $this->logger->info('NOTAM cache updated from API', ['icao' => $icao, 'count' => count($normalized)]);

            return $this->json($normalized, 200);
        } catch (\Throwable $e) {
            $this->logger->error('NOTAM API error', ['icao' => $icao, 'error' => $e->getMessage()]);

            $stale = $cacheRepo->find($icao);
            if ($stale) {
                $this->logger->warning('Returning stale NOTAM cache due to API error', ['icao' => $icao]);
                return $this->json($stale->getData(), 200);
            }

            return $this->json(['error' => $e->getMessage()], 502);
        }
    }

    private function normalizeMetar(array $items): array
    {
        return array_map(function (array $item) {
            return [
                'raw_text' => $item['rawOb'] ?? null,
                'observed' => $item['reportTime'] ?? null,
                'station'  => $item['icaoId'] ?? null,
                'temperature' => ['celsius' => $item['temp'] ?? null],
                'dewpoint'    => ['celsius' => $item['dewp'] ?? null],
                'wind' => [
                    'degrees' => $item['wdir'] ?? null,
                    'speed_kts' => $item['wspd'] ?? null,
                    'gust_kts' => $item['wgst'] ?? null,
                ],
                'visibility' => ['meters_float' => isset($item['visib']) ? $item['visib'] * 1609.34 : null],
                'barometer'  => ['hpa' => $item['altim'] ?? null],
                'clouds' => array_map(fn($c) => [
                    'code' => $c['cover'] ?? null,
                    'base_feet_agl' => $c['base'] ?? null,
                ], $item['clouds'] ?? []),
            ];
        }, $items);
    }

    private function normalizeTaf(array $items): array
    {
        return array_map(function (array $item) {
            $from = isset($item['validTimeFrom']) ? date('c', $item['validTimeFrom']) : null;
            $to   = isset($item['validTimeTo'])   ? date('c', $item['validTimeTo'])   : null;

            return [
                'raw_text'  => $item['rawTAF'] ?? null,
                'station'   => $item['icaoId'] ?? null,
                'timestamp' => ['from' => $from, 'to' => $to],
            ];
        }, $items);
    }
}
