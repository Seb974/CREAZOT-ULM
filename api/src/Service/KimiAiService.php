<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\SiteSettingsRepository;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class KimiAiService
{
    private const BASE_URL = 'https://api.moonshot.ai/v1/chat/completions';

    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
        private LoggerInterface $logger,
    ) {}

    private function getApiKey(): string
    {
        $settings = $this->siteSettingsRepo->findInstance();
        $key = $settings?->getKimiApiKey();

        if (!$key) {
            throw new \RuntimeException('Clé API Kimi non configurée. Rendez-vous dans Paramétrage SaaS.');
        }

        return $key;
    }

    public function chat(string $systemPrompt, string $userMessage, bool $thinking = false): string
    {
        return $this->call([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage],
        ], $thinking);
    }

    public function analyzeNotam(string $rawNotam, string $icao): string
    {
        $nowUtc = (new \DateTime("now", new \DateTimeZone("UTC")))->format("Y-m-d H:i");

        $system = <<<PROMPT
Tu es un expert en aéronautique spécialisé dans l'interprétation des NOTAMs pour pilotes ULM et aviation légère VFR.
Ton rôle est de traduire un NOTAM brut en langage clair et compréhensible.

RÈGLES CRITIQUES SUR LES HORAIRES :
- TOUS les horaires dans un NOTAM (champs B, C, D, E) sont TOUJOURS exprimés en UTC
- Tu DOIS convertir en heure locale pour l'affichage. Pour les aérodromes FMEE/FMEP/FMCZ (La Réunion/Mayotte) : UTC+4. Pour la France métropolitaine (LF..) : UTC+1 (hiver) ou UTC+2 (été)
- Affiche TOUJOURS les deux : "HHhMM UTC (HHhMM locale)"
- Le champ B) = début de validité, C) = fin de validité, format AAMMJJHHMM

RÈGLES CRITIQUES SUR LE CHAMP D) (horaires d'activité) :
- D) définit les créneaux d'activité DANS la période B-C
- "SR" = Sunrise (lever du soleil), "SS" = Sunset (coucher du soleil)
- "SS.PLUS15" = Sunset + 15 minutes, "SR.MINUS30" = Sunrise - 30 minutes
- "SR-SS" = du lever au coucher du soleil (heures de jour)
- "SS.PLUS15-1930" = de Sunset+15min à 19h30 UTC — c'est un créneau NOCTURNE
- Si un créneau D) ne couvre que les heures de nuit (après sunset), PRÉCISE QUE CELA N'AFFECTE PAS les vols VFR de jour

CONTEXTE ULM/VFR :
- Les ULM volent exclusivement en VFR, donc uniquement de jour (entre aube et crépuscule civil)
- Si une restriction ne s'applique qu'après le coucher du soleil, elle n'a PAS d'impact opérationnel pour un vol ULM de jour
- Mentionne clairement si le NOTAM affecte ou non les vols ULM/VFR de jour

Règles générales :
- Réponds UNIQUEMENT en français
- Sois concis (3-5 lignes maximum)
- Structure ta réponse : Type | Zone | Période (UTC et locale) | Impact opérationnel ULM/VFR
- N'invente rien, base-toi uniquement sur le contenu du NOTAM

Date/heure actuelles : {$nowUtc} UTC
PROMPT;

        $user = "Aérodrome : {$icao}\n\nNOTAM brut :\n{$rawNotam}";

        return $this->call([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ], false);
    }

    public function briefMeteo(string $metar, string $taf, string $icao): string
    {
        $system = <<<PROMPT
Tu es un briefeur météo aéronautique pour pilotes ULM et aviation légère.
Ton rôle est de produire un briefing météo clair et opérationnel à partir des données METAR et TAF brutes.

Structure ton briefing ainsi :
1. **Conditions actuelles** : type de vol (VFR/MVFR/IFR), visibilité, plafond
2. **Vent** : direction, force, rafales éventuelles, composante de travers par rapport aux pistes si possible
3. **Phénomènes significatifs** : précipitations, orages, brouillard, givrage
4. **Tendance** (si TAF disponible) : évolution attendue dans les prochaines heures
5. **Recommandation** : une phrase opérationnelle (ex: "Vol VFR possible", "Prudence vent de travers", "Vol déconseillé")

Règles :
- Réponds UNIQUEMENT en français
- Sois concis et opérationnel
- Si un METAR ou TAF est absent, précise-le
PROMPT;

        $parts = ["Aérodrome : {$icao}"];
        if ($metar) {
            $parts[] = "METAR brut :\n{$metar}";
        } else {
            $parts[] = "METAR : non disponible";
        }
        if ($taf) {
            $parts[] = "TAF brut :\n{$taf}";
        } else {
            $parts[] = "TAF : non disponible";
        }

        return $this->call([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => implode("\n\n", $parts)],
        ], false);
    }

    /**
     * Classify NOTAMs into 3 categories: blocking, attention, informational.
     */
    public function classifyNotams(array $notams, string $icao): array
    {
        if (empty($notams)) {
            return ['blocking' => [], 'attention' => [], 'informational' => []];
        }

        $notamTexts = [];
        foreach ($notams as $i => $notam) {
            $id = $notam['id'] ?? ('NOTAM_' . ($i + 1));
            $raw = $notam['raw'] ?? $notam['body'] ?? 'N/A';
            $start = $notam["startDate"] ?? "?";
            $end = $notam["endDate"] ?? "?";
            $notamTexts[] = "--- NOTAM #{$id} ---\nValide du {$start} au {$end}\n{$raw}";
        }

        $nowUtc = (new \DateTime("now", new \DateTimeZone("UTC")))->format("Y-m-d H:i");

        $system = <<<PROMPT
Tu es un expert aéronautique spécialisé ULM et aviation légère VFR.
On te donne une liste de NOTAMs pour l'aérodrome {$icao}.

Date et heure actuelles (UTC) : {$nowUtc} UTC.

CONTEXTE OPÉRATIONNEL CRITIQUE :
- Les ULM volent EXCLUSIVEMENT en VFR, c'est-à-dire uniquement pendant les heures de JOUR (entre aube civile et crépuscule civil)
- Un NOTAM dont les restrictions ne s'appliquent qu'après le coucher du soleil (SS, sunset) n'a AUCUN impact sur les vols ULM de jour
- Le champ D) du NOTAM définit les créneaux d'activité : "SR" = Sunrise, "SS" = Sunset, "SS.PLUS15" = Sunset + 15min
- Exemple : "D) SS.PLUS15-1930" = restriction active uniquement de sunset+15min à 19h30 UTC → PAS d'impact pour un vol de jour

RÈGLES HORAIRES :
- Tous les horaires NOTAM sont en UTC
- Le champ D) est crucial : il précise QUAND dans la journée la restriction s'applique
- Si D) indique un créneau uniquement nocturne (après sunset), le NOTAM est INFORMATIF, pas bloquant ni attention

Ta mission : classifier CHAQUE NOTAM dans exactement UNE des TROIS catégories.

=== BLOQUANT ===
Un NOTAM est BLOQUANT **uniquement** si, PENDANT LES HEURES DE JOUR, l'une de ces conditions est remplie :
- L'aérodrome est FERMÉ (AD CLSD, AP CLSD) pendant les heures de jour
- TOUTES les pistes sont fermées simultanément pendant les heures de jour
- L'espace aérien est INTERDIT (PROHIBITED, P-zone active) pendant les heures de jour rendant TOUT départ/arrivée impossible

=== ATTENTION ===
Un NOTAM est ATTENTION s'il concerne un élément important pour la sécurité du vol VFR de jour mais qui N'EMPÊCHE PAS de voler :
- Obstacles sur ou près du terrain (végétation, grues, constructions)
- Activités aériennes à proximité (parapentes, parachutisme, compétitions, drones)
- Zones D/R activées à proximité pendant le jour
- Travaux sur le terrain sans fermeture complète pendant le jour
- Restrictions partielles de piste pendant le jour (RWY restricted mais pas fermée, ou une piste sur deux)

=== INFORMATIF ===
Un NOTAM est INFORMATIF s'il n'a pas d'impact sur un vol VFR de jour :
- Restrictions s'appliquant UNIQUEMENT après sunset (créneau D) nocturne)
- Balisage lumineux hors service (concerne le vol de nuit, pas le VFR de jour)
- Modifications de fréquences, procédures, changements administratifs
- Restrictions ne concernant pas les ULM (type d'aéronef, aéronefs étrangers)
- NOTAM liés à d'autres aérodromes que {$icao}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de commentaires), avec cette structure exacte :
{"blocking":[{"id":"NOTAM_ID","reason":"raison courte"}],"attention":[{"id":"NOTAM_ID","reason":"raison courte"}],"informational":[{"id":"NOTAM_ID","reason":"raison courte"}]}
PROMPT;

        $user = implode("\n\n", $notamTexts);

        try {
            $raw = $this->call([
                ['role' => 'system', 'content' => $system],
                ['role' => 'user', 'content' => $user],
            ], false);

            $raw = trim($raw);
            if (str_starts_with($raw, '```')) {
                $raw = preg_replace('/^```(?:json)?\s*/i', '', $raw);
                $raw = preg_replace('/\s*```$/', '', $raw);
            }

            $parsed = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->logger->warning('Kimi NOTAM classification: invalid JSON', ['raw' => $raw]);
                return ['blocking' => [], 'attention' => [], 'informational' => [], 'raw_response' => $raw];
            }

            return [
                'blocking' => $parsed['blocking'] ?? [],
                'attention' => $parsed['attention'] ?? [],
                'informational' => $parsed['informational'] ?? [],
            ];
        } catch (\Throwable $e) {
            $this->logger->error('Kimi NOTAM classification failed', ['error' => $e->getMessage()]);
            return ['blocking' => [], 'attention' => [], 'informational' => [], 'error' => $e->getMessage()];
        }
    }

    public function analyzeImage(string $base64Image, string $mimeType, string $question): string
    {
        $system = <<<PROMPT
Tu es un expert météo aéronautique. On te fournit une capture d'écran d'une carte météo (type Windy, MétéoFrance, etc.).
Analyse la carte et fournis un briefing opérationnel pour un pilote ULM/aviation légère.
Réponds UNIQUEMENT en français. Sois concis et opérationnel.
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => [
                [
                    'type' => 'image_url',
                    'image_url' => ['url' => "data:{$mimeType};base64,{$base64Image}"],
                ],
                [
                    'type' => 'text',
                    'text' => $question,
                ],
            ]],
        ];

        return $this->call($messages, false);
    }

    private function call(array $messages, bool $thinking): string
    {
        $apiKey = $this->getApiKey();

        $body = [
            'model' => 'kimi-k2.5',
            'messages' => $messages,
            'thinking' => ['type' => $thinking ? 'enabled' : 'disabled'],
        ];

        if (!$thinking) {
            $body['temperature'] = 0.6;
        }

        try {
            $response = $this->httpClient->request('POST', self::BASE_URL, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $body,
                'timeout' => 30,
            ]);

            $data = $response->toArray(false);

            if (isset($data['error'])) {
                $msg = $data['error']['message'] ?? 'Erreur inconnue';
                $this->logger->error('Kimi API error', ['error' => $msg]);
                throw new \RuntimeException('Erreur Kimi : ' . $msg);
            }

            return $data['choices'][0]['message']['content'] ?? '';

        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $this->logger->error('Kimi API call failed', ['error' => $e->getMessage()]);
            throw new \RuntimeException('Impossible de contacter Kimi : ' . $e->getMessage());
        }
    }
}
