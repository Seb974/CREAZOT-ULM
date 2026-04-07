<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FlightRule;

class ScoreOpsService
{
    /**
     * @param array{notam_analysis?: array} $context  Extra context (lat, lng, timezone, notam AI results)
     */
    public function evaluate(array $metar, array $notams, FlightRule $rule, array $context = []): array
    {
        $checks = [];
        $overall = 'go';

        $wind = $metar['wind'] ?? [];
        $speedKts = $wind['speed_kts'] ?? 0;
        $gustKts = $wind['gust_kts'] ?? null;
        $windDeg = $wind['degrees'] ?? 0;
        $visMeters = $metar['visibility']['meters_float'] ?? 9999;
        $clouds = $metar['clouds'] ?? [];

        $ceilingFt = $this->extractCeiling($clouds);

        // --- Wind ---
        $checks[] = $this->check('Vent', $speedKts, $rule->getLimiteWindKts(), $rule->getMaxWindKts(), 'kt', 'above');
        $overall = $this->worst($overall, end($checks)['status']);

        if ($gustKts !== null && $gustKts > 0) {
            $checks[] = $this->check('Rafales', $gustKts, $rule->getLimiteGustKts(), $rule->getMaxGustKts(), 'kt', 'above');
            $overall = $this->worst($overall, end($checks)['status']);
        }

        // --- Visibility ---
        $checks[] = $this->check('Visibilité', $visMeters, $rule->getLimiteVisibilityM(), $rule->getMinVisibilityM(), 'm', 'below');
        $overall = $this->worst($overall, end($checks)['status']);

        // --- Ceiling ---
        if ($ceilingFt !== null) {
            $checks[] = $this->check('Plafond', $ceilingFt, $rule->getLimiteCeilingFt(), $rule->getMinCeilingFt(), 'ft', 'below');
            $overall = $this->worst($overall, end($checks)['status']);
        }

        // --- Day/Night ---
        $dayNight = $this->evaluateDayNight($rule, $context);
        if ($dayNight !== null) {
            $checks[] = $dayNight;
            $overall = $this->worst($overall, $dayNight['status']);
        }

        // --- NOTAM (AI or legacy) ---
        $notamCheck = $this->evaluateNotams($notams, $rule, $context);
        if ($notamCheck !== null) {
            $checks[] = $notamCheck;
            $overall = $this->worst($overall, $notamCheck['status']);
        }

        return [
            'result' => $overall,
            'checks' => $checks,
            'conditions' => [
                'wind_kts' => $speedKts,
                'gust_kts' => $gustKts,
                'wind_deg' => $windDeg,
                'visibility_m' => $visMeters,
                'ceiling_ft' => $ceilingFt,
                'notam_count' => count($notams),
            ],
        ];
    }

    private function evaluateDayNight(FlightRule $rule, array $context): ?array
    {
        $lat = $context['lat'] ?? null;
        $lng = $context['lng'] ?? null;
        $tz = $context['timezone'] ?? 'UTC';

        if ($lat === null || $lng === null) {
            return null;
        }

        $now = new \DateTime('now', new \DateTimeZone($tz));
        $timestamp = $now->getTimestamp();

        $sunInfo = date_sun_info($timestamp, (float) $lat, (float) $lng);
        $civilDawn = $sunInfo['civil_twilight_begin'];
        $civilDusk = $sunInfo['civil_twilight_end'];

        if ($civilDawn === false || $civilDusk === false || $civilDawn === true || $civilDusk === true) {
            return null;
        }

        $dayMarginSec = $rule->getDayMarginMinutes() * 60;
        $nightMarginSec = $rule->getNightMarginMinutes() * 60;

        $windowStart = $civilDawn - $dayMarginSec;
        $windowEnd = $civilDusk + $nightMarginSec;

        $dawnLocal = (new \DateTime('@' . $civilDawn))->setTimezone(new \DateTimeZone($tz));
        $duskLocal = (new \DateTime('@' . $civilDusk))->setTimezone(new \DateTimeZone($tz));
        $startLocal = (new \DateTime('@' . $windowStart))->setTimezone(new \DateTimeZone($tz));
        $endLocal = (new \DateTime('@' . $windowEnd))->setTimezone(new \DateTimeZone($tz));

        $bufferSec = 15 * 60;

        if ($timestamp >= $windowStart && $timestamp <= $windowEnd) {
            $nearEdge = ($timestamp - $windowStart < $bufferSec) || ($windowEnd - $timestamp < $bufferSec);
            return [
                'label' => 'Jour aéronautique',
                'value' => $now->format('H:i'),
                'unit' => '',
                'status' => $nearEdge ? 'limite' : 'go',
                'detail' => sprintf(
                    'Fenêtre autorisée : %s – %s (aube %s, crépuscule %s)',
                    $startLocal->format('H:i'),
                    $endLocal->format('H:i'),
                    $dawnLocal->format('H:i'),
                    $duskLocal->format('H:i')
                ),
            ];
        }

        return [
            'label' => 'Jour aéronautique',
            'value' => $now->format('H:i'),
            'unit' => '',
            'status' => 'nogo',
            'detail' => sprintf(
                'Hors fenêtre de vol : %s – %s',
                $startLocal->format('H:i'),
                $endLocal->format('H:i')
            ),
        ];
    }

    private function evaluateNotams(array $notams, FlightRule $rule, array $context): ?array
    {
        $notamCount = count($notams);
        if ($notamCount === 0) {
            return null;
        }

        $strategy = $rule->getNotamStrategy();

        if ($strategy === 'ignore') {
            return [
                'label' => 'NOTAM',
                'value' => $notamCount,
                'unit' => '',
                'status' => 'go',
                'detail' => $notamCount . ' NOTAM' . ($notamCount > 1 ? 's' : '') . ' (non pris en compte)',
            ];
        }

        // AI classification available
        $aiAnalysis = $context['notam_analysis'] ?? null;
        if ($strategy === 'ai' && $aiAnalysis !== null) {
            $blocking = $aiAnalysis['blocking'] ?? [];
            $blockingCount = count($blocking);
            $infoCount = $notamCount - $blockingCount;

            if ($blockingCount > 0) {
                $labels = array_map(fn($b) => $b['id'] ?? '?', $blocking);
                return [
                    'label' => 'NOTAM',
                    'value' => $blockingCount . '/' . $notamCount,
                    'unit' => '',
                    'status' => 'nogo',
                    'detail' => $blockingCount . ' NOTAM bloquant' . ($blockingCount > 1 ? 's' : '')
                        . ' (Kimi) : ' . implode(', ', array_slice($labels, 0, 3)),
                    'notam_details' => $aiAnalysis,
                ];
            }

            return [
                'label' => 'NOTAM',
                'value' => $notamCount,
                'unit' => '',
                'status' => 'go',
                'detail' => $notamCount . ' NOTAM informatif' . ($notamCount > 1 ? 's' : '') . ' (aucun bloquant)',
                'notam_details' => $aiAnalysis,
            ];
        }

        // Legacy fallback: block or warn based on count
        $notamStatus = match ($strategy) {
            'block' => 'nogo',
            'warn' => 'limite',
            default => 'go',
        };

        return [
            'label' => 'NOTAM',
            'value' => $notamCount,
            'unit' => '',
            'status' => $notamStatus,
            'detail' => $notamCount . ' NOTAM' . ($notamCount > 1 ? 's' : '') . ' actif' . ($notamCount > 1 ? 's' : ''),
        ];
    }

    private function check(string $label, float|int $value, int $limiteThreshold, int $nogoThreshold, string $unit, string $direction): array
    {
        if ($direction === 'above') {
            if ($value >= $nogoThreshold) {
                $status = 'nogo';
            } elseif ($value >= $limiteThreshold) {
                $status = 'limite';
            } else {
                $status = 'go';
            }
        } else {
            if ($value <= $nogoThreshold) {
                $status = 'nogo';
            } elseif ($value <= $limiteThreshold) {
                $status = 'limite';
            } else {
                $status = 'go';
            }
        }

        return [
            'label' => $label,
            'value' => $value,
            'unit' => $unit,
            'status' => $status,
            'detail' => $value . ' ' . $unit,
        ];
    }

    private function extractCeiling(array $clouds): ?int
    {
        $ceilingCodes = ['BKN', 'OVC', 'VV'];
        $ceiling = null;
        foreach ($clouds as $layer) {
            $code = $layer['code'] ?? '';
            $base = $layer['base_feet_agl'] ?? null;
            if (in_array($code, $ceilingCodes, true) && $base !== null) {
                if ($ceiling === null || $base < $ceiling) {
                    $ceiling = $base;
                }
            }
        }
        return $ceiling;
    }

    private function worst(string $a, string $b): string
    {
        $rank = ['go' => 0, 'limite' => 1, 'nogo' => 2];
        return ($rank[$b] ?? 0) > ($rank[$a] ?? 0) ? $b : $a;
    }
}
