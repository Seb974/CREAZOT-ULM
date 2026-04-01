<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WeatherProxyController extends AbstractController
{
    private const NOAA_BASE = 'https://aviationweather.gov/api/data';

    public function __construct(
        private HttpClientInterface $httpClient,
    ) {}

    #[Route('/admin/weather/{type}/{icao}', name: 'weather_proxy', methods: ['GET'], requirements: ['type' => 'metar|taf'])]
    public function getWeather(string $type, string $icao): JsonResponse
    {
        $icao = strtoupper(trim($icao));
        $url = sprintf('%s/%s?ids=%s&format=json', self::NOAA_BASE, $type, $icao);

        try {
            $response = $this->httpClient->request('GET', $url, ['timeout' => 10]);
            $noaaData = $response->toArray();

            if (empty($noaaData)) {
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
