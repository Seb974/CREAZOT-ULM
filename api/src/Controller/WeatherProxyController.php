<?php

namespace App\Controller;

use App\Repository\SiteSettingsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WeatherProxyController extends AbstractController
{
    private const NOAA_BASE = 'https://aviationweather.gov/api/data';
    private const ICAO_NOTAM_URL = 'https://applications.icao.int/dataservices/api/notams-realtime-list';

    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
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
    public function getNotams(string $icao): JsonResponse
    {
        $icao = strtoupper(trim($icao));

        $settings = $this->siteSettingsRepo->findOneBy([], ['id' => 'ASC']);
        $apiKey = $settings?->getIcaoApiKey();

        if (!$apiKey) {
            return $this->json([
                'error' => 'Clé API ICAO non configurée. Rendez-vous dans Paramétrage SaaS pour la renseigner.',
            ], 422);
        }

        $url = sprintf(
            '%s?api_key=%s&format=json&criticality=&locations=%s',
            self::ICAO_NOTAM_URL,
            urlencode($apiKey),
            $icao
        );

        try {
            $response = $this->httpClient->request('GET', $url, ['timeout' => 15]);
            $content = $response->getContent(false);

            if (empty(trim($content))) {
                return $this->json([], 200);
            }

            $data = json_decode($content, true);

            if (!is_array($data)) {
                return $this->json([], 200);
            }

            $normalized = array_map(function (array $item) {
                return [
                    'id'        => $item['id'] ?? $item['key'] ?? null,
                    'raw'       => $item['all'] ?? $item['message'] ?? null,
                    'body'      => $item['ItemE'] ?? $item['message'] ?? null,
                    'type'      => $item['type'] ?? null,
                    'startDate' => $item['startdate'] ?? $item['effectivStart'] ?? null,
                    'endDate'   => $item['enddate'] ?? $item['effectiveEnd'] ?? null,
                    'location'  => $item['location'] ?? $icao,
                    'qualifiers' => [
                        'subject' => $item['QCode_2_3'] ?? null,
                    ],
                ];
            }, $data);

            return $this->json($normalized, 200);
        } catch (\Throwable $e) {
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
