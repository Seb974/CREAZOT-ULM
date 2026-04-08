<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FlightRule;

class ScoreOpsService
{
    /**
     * @param array $context  Extra context: lat, lng, timezone, notam_analysis, taf_fcsts
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

        $checks[] = $this->check('Vent', $speedKts, $rule->getLimiteWindKts(), $rule->getMaxWindKts(), 'kt', 'above');
        $overall = $this->worst($overall, end($checks)['status']);

        if ($gustKts !== null && $gustKts > 0) {
            $checks[] = $this->check('Rafales', $gustKts, $rule->getLimiteGustKts(), $rule->getMaxGustKts(), 'kt', 'above');
            $overall = $this->worst($overall, end($checks)['status']);
        }

        $checks[] = $this->check('Visibilité', $visMeters, $rule->getLimiteVisibilityM(), $rule->getMinVisibilityM(), 'm', 'below');
        $overall = $this->worst($overall, end($checks)['status']);

        if ($ceilingFt !== null) {
            $checks[] = $this->check('Plafond', $ceilingFt, $rule->getLimiteCeilingFt(), $rule->getMinCeilingFt(), 'ft', 'below');
            $overall = $this->worst($overall, end($checks)['status']);
        }

        $dayNight = $this->evaluateDayNight($rule, $context);
        if ($dayNight !== null) {
            $checks[] = $dayNight;
            $overall = $this->worst($overall, $dayNight['status']);
        }

        $tafCheck = $this->evaluateTafTrend($rule, $context);
        if ($tafCheck !== null) {
            $checks[] = $tafCheck;
            $overall = $this->worst($overall, $tafCheck['status']);
        }

        $notamCheck = $this->evaluateNotams($notams, $rule, $context);
        if ($notamCheck !== null) {
            $checks[] = $notamCheck;
            if ($notamCheck['status'] === 'nogo') {
                $overall = 'nogo';
            }
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
        $flightDurationSec = $rule->getMinFlightDurationMinutes() * 60;

        $windowStart = $civilDawn + $dayMarginSec;
        $windowEnd = $civilDusk - $nightMarginSec;

        $dawnLocal = (new \DateTime('@' . $civilDawn))->setTimezone(new \DateTimeZone($tz));
        $duskLocal = (new \DateTime('@' . $civilDusk))->setTimezone(new \DateTimeZone($tz));
        $startLocal = (new \DateTime('@' . $windowStart))->setTimezone(new \DateTimeZone($tz));
        $endLocal = (new \DateTime('@' . $windowEnd))->setTimezone(new \DateTimeZone($tz));

        $remainingMinutes = (int) round(($windowEnd - $timestamp) / 60);

        if ($timestamp < $windowStart) {
            $minutesUntilOpen = (int) round(($windowStart - $timestamp) / 60);
            return [
                'label' => 'Jour aéronautique',
                'value' => $now->format('H:i'),
                'unit' => '',
                'status' => 'nogo',
                'detail' => sprintf(
                    'Trop tôt — fenêtre de vol : %s – %s (ouvre dans %d min). Aube civile %s, crépuscule %s.',
                    $startLocal->format('H:i'),
                    $endLocal->format('H:i'),
                    $minutesUntilOpen,
                    $dawnLocal->format('H:i'),
                    $duskLocal->format('H:i')
                ),
            ];
        }

        if ($timestamp > $windowEnd) {
            return [
                'label' => 'Jour aéronautique',
                'value' => $now->format('H:i'),
                'unit' => '',
                'status' => 'nogo',
                'detail' => sprintf(
                    'Trop tard — fenêtre de vol terminée à %s. Crépuscule civil à %s.',
                    $endLocal->format('H:i'),
                    $duskLocal->format('H:i')
                ),
            ];
        }

        if ($remainingMinutes < $rule->getMinFlightDurationMinutes()) {
            return [
                'label' => 'Jour aéronautique',
                'value' => $now->format('H:i'),
                'unit' => '',
                'status' => 'nogo',
                'detail' => sprintf(
                    'Temps restant insuffisant : %d min (minimum requis : %d min). Fin de fenêtre à %s.',
                    $remainingMinutes,
                    $rule->getMinFlightDurationMinutes(),
                    $endLocal->format('H:i')
                ),
            ];
        }

        $limiteThresholdMin = (int) round($rule->getMinFlightDurationMinutes() * 1.5);
        if ($remainingMinutes < $limiteThresholdMin) {
            return [
                'label' => 'Jour aéronautique',
                'value' => $now->format('H:i'),
                'unit' => '',
                'status' => 'limite',
                'detail' => sprintf(
                    'Attention : %d min restantes avant fin de fenêtre à %s (vol min. %d min). Aube %s, crépuscule %s.',
                    $remainingMinutes,
                    $endLocal->format('H:i'),
                    $rule->getMinFlightDurationMinutes(),
                    $dawnLocal->format('H:i'),
                    $duskLocal->format('H:i')
                ),
            ];
        }

        return [
            'label' => 'Jour aéronautique',
            'value' => $now->format('H:i'),
            'unit' => '',
            'status' => 'go',
            'detail' => sprintf(
                'Fenêtre de vol : %s – %s (%d min restantes). Aube civile %s, crépuscule %s.',
                $startLocal->format('H:i'),
                $endLocal->format('H:i'),
                $remainingMinutes,
                $dawnLocal->format('H:i'),
                $duskLocal->format('H:i')
            ),
        ];
    }

    private function evaluateTafTrend(FlightRule $rule, array $context): ?array
    {
        $tafFcsts = $context['taf_fcsts'] ?? null;
        if (empty($tafFcsts) || !is_array($tafFcsts)) {
            return null;
        }

        $tz = $context['timezone'] ?? 'UTC';
        $now = new \DateTime('now', new \DateTimeZone($tz));
        $nowTs = $now->getTimestamp();
        $flightWindowEnd = $nowTs + ($rule->getMinFlightDurationMinutes() * 60 * 2);

        $degradations = [];

        foreach ($tafFcsts as $period) {
            $periodFrom = $period['timeFrom'] ?? 0;
            $periodTo = $period['timeTo'] ?? 0;

            if ($periodTo < $nowTs || $periodFrom > $flightWindowEnd) {
                continue;
            }

            $wspd = $period['wspd'] ?? 0;
            $wgst = $period['wgst'] ?? null;
            $visibRaw = $period['visib'] ?? '6+';
            $wxString = $period['wxString'] ?? null;
            $clouds = $period['clouds'] ?? [];

            $visibSm = is_numeric($visibRaw) ? (float) $visibRaw : 7.0;
            $visibM = $visibSm * 1609.34;

            $ceilingFt = null;
            foreach ($clouds as $layer) {
                $cover = $layer['cover'] ?? '';
                $base = $layer['base'] ?? null;
                if (in_array($cover, ['BKN', 'OVC', 'VV'], true) && $base !== null) {
                    if ($ceilingFt === null || $base < $ceilingFt) {
                        $ceilingFt = (int) $base;
                    }
                }
            }

            $fromLocal = (new \DateTime('@' . $periodFrom))->setTimezone(new \DateTimeZone($tz));
            $changeType = $period['fcstChange'] ?? '';
            $prefix = $changeType ? "({$changeType}) " : '';

            if ($wspd >= $rule->getMaxWindKts()) {
                $degradations[] = ['severity' => 'nogo', 'msg' => "{$prefix}Vent prévu {$wspd}kt à {$fromLocal->format('H:i')}"];
            } elseif ($wspd >= $rule->getLimiteWindKts()) {
                $degradations[] = ['severity' => 'limite', 'msg' => "{$prefix}Vent prévu {$wspd}kt à {$fromLocal->format('H:i')}"];
            }

            if ($wgst !== null && $wgst > 0) {
                if ($wgst >= $rule->getMaxGustKts()) {
                    $degradations[] = ['severity' => 'nogo', 'msg' => "{$prefix}Rafales prévues {$wgst}kt à {$fromLocal->format('H:i')}"];
                } elseif ($wgst >= $rule->getLimiteGustKts()) {
                    $degradations[] = ['severity' => 'limite', 'msg' => "{$prefix}Rafales prévues {$wgst}kt à {$fromLocal->format('H:i')}"];
                }
            }

            if ($visibM <= $rule->getMinVisibilityM()) {
                $degradations[] = ['severity' => 'nogo', 'msg' => sprintf("{$prefix}Visibilité prévue %.0fm à %s", $visibM, $fromLocal->format('H:i'))];
            } elseif ($visibM <= $rule->getLimiteVisibilityM()) {
                $degradations[] = ['severity' => 'limite', 'msg' => sprintf("{$prefix}Visibilité prévue %.0fm à %s", $visibM, $fromLocal->format('H:i'))];
            }

            if ($ceilingFt !== null) {
                if ($ceilingFt <= $rule->getMinCeilingFt()) {
                    $degradations[] = ['severity' => 'nogo', 'msg' => "{$prefix}Plafond prévu {$ceilingFt}ft à {$fromLocal->format('H:i')}"];
                } elseif ($ceilingFt <= $rule->getLimiteCeilingFt()) {
                    $degradations[] = ['severity' => 'limite', 'msg' => "{$prefix}Plafond prévu {$ceilingFt}ft à {$fromLocal->format('H:i')}"];
                }
            }

            if ($wxString !== null) {
                $wx = strtoupper($wxString);
                if (preg_match('/TS|\+RA|\+SN|FG|SQ|FC|SS|DS/', $wx)) {
                    $decoded = $this->decodeWxString($wx);
                    $degradations[] = ['severity' => 'nogo', 'msg' => "{$prefix}{$decoded} prévu à {$fromLocal->format('H:i')}"];
                } elseif (preg_match('/RA|SN|BR|HZ|DZ/', $wx)) {
                    $decoded = $this->decodeWxString($wx);
                    $degradations[] = ['severity' => 'limite', 'msg' => "{$prefix}{$decoded} prévu à {$fromLocal->format('H:i')}"];
                }
            }
        }

        if (empty($degradations)) {
            return [
                'label' => 'Tendance TAF',
                'value' => 'stable',
                'unit' => '',
                'status' => 'go',
                'detail' => 'Pas de dégradation prévue dans les prochaines heures.',
            ];
        }

        $worstSeverity = 'limite';
        $messages = [];
        foreach ($degradations as $d) {
            $worstSeverity = $this->worst($worstSeverity, $d['severity']);
            $messages[] = $d['msg'];
        }

        return [
            'label' => 'Tendance TAF',
            'value' => $worstSeverity === 'nogo' ? 'dégradation' : 'variable',
            'unit' => '',
            'status' => $worstSeverity,
            'detail' => implode(' | ', array_slice($messages, 0, 4)),
        ];
    }

    private function decodeWxString(string $wx): string
    {
        $map = [
            'TS' => 'Orage', '+RA' => 'Forte pluie', 'RA' => 'Pluie',
            '+SN' => 'Forte neige', 'SN' => 'Neige', 'FG' => 'Brouillard',
            'BR' => 'Brume', 'HZ' => 'Brume sèche', 'DZ' => 'Bruine',
            'SQ' => 'Grain', 'FC' => 'Trombe', 'SS' => 'Tempête de sable',
            'DS' => 'Tempête de poussière', 'SH' => 'Averses',
        ];
        foreach ($map as $code => $label) {
            if (str_contains($wx, $code)) {
                return $label;
            }
        }
        return $wx;
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

        $aiAnalysis = $context['notam_analysis'] ?? null;
        if ($strategy === 'ai' && $aiAnalysis !== null) {
            $blocking = $aiAnalysis['blocking'] ?? [];
            $attention = $aiAnalysis['attention'] ?? [];
            $blockingCount = count($blocking);
            $attentionCount = count($attention);

            if ($blockingCount > 0) {
                $labels = array_map(fn($b) => $b['id'] ?? '?', $blocking);
                return [
                    'label' => 'NOTAM',
                    'value' => $blockingCount . '/' . $notamCount,
                    'unit' => '',
                    'status' => 'nogo',
                    'detail' => $blockingCount . ' NOTAM bloquant' . ($blockingCount > 1 ? 's' : '')
                        . ' : ' . implode(', ', array_slice($labels, 0, 3)),
                    'notam_details' => $aiAnalysis,
                ];
            }

            if ($attentionCount > 0) {
                $labels = array_map(fn($a) => $a['id'] ?? '?', $attention);
                return [
                    'label' => 'NOTAM',
                    'value' => $attentionCount . '/' . $notamCount,
                    'unit' => '',
                    'status' => 'limite',
                    'detail' => $attentionCount . ' NOTAM vigilance — cliquez pour détails',
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
