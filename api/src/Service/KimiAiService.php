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
        $system = <<<PROMPT
Tu es un expert en aéronautique spécialisé dans l'interprétation des NOTAMs.
Ton rôle est de traduire un NOTAM brut en langage clair et compréhensible pour un pilote ULM ou aviation légère francophone.

Règles :
- Réponds UNIQUEMENT en français
- Sois concis (3-5 lignes maximum)
- Structure ta réponse : Type | Zone | Période | Impact opérationnel
- Si le NOTAM concerne une fermeture de piste, une restriction d'espace aérien ou un danger, mets-le en évidence
- Utilise un vocabulaire pilote (QFU, CTR, TMA, FL, AMSL, etc.) quand c'est pertinent
- N'invente rien, base-toi uniquement sur le contenu du NOTAM
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
     * Classify NOTAMs as blocking or informational for a given airport.
     * Returns structured array: { blocking: [{id, reason}], informational: [{id, reason}] }
     */
    public function classifyNotams(array $notams, string $icao): array
    {
        if (empty($notams)) {
            return ['blocking' => [], 'informational' => []];
        }

        $notamTexts = [];
        foreach ($notams as $i => $notam) {
            $id = $notam['id'] ?? ('NOTAM_' . ($i + 1));
            $raw = $notam['raw'] ?? $notam['body'] ?? 'N/A';
            $notamTexts[] = "--- NOTAM #{$id} ---\n{$raw}";
        }

        $system = <<<PROMPT
Tu es un expert aéronautique. On te donne une liste de NOTAMs pour l'aérodrome {$icao}.

Ta mission : classifier chaque NOTAM en deux catégories :
- **BLOQUANT** : empêche concrètement le vol depuis/vers cet aérodrome (fermeture de piste, fermeture d'aérodrome, restriction d'espace aérien rendant le vol impossible, danger réel sur le terrain)
- **INFORMATIF** : n'empêche pas le vol (interdictions ne concernant pas les ULM/aviation légère locale, informations générales, modifications de fréquences, restrictions sur d'autres types d'aéronefs, travaux mineurs sans fermeture)

Exemples :
- Interdiction de survol pour les aéronefs russes → INFORMATIF (ne concerne pas les ULM locaux)
- Piste fermée pour travaux → BLOQUANT
- Modification de fréquence TWR → INFORMATIF
- Zone dangereuse activée dans la CTR → BLOQUANT
- Balisage lumineux hors service la nuit → INFORMATIF (si vol de jour)

Réponds UNIQUEMENT en JSON valide, sans markdown, avec cette structure :
{"blocking":[{"id":"NOTAM_ID","reason":"raison courte"}],"informational":[{"id":"NOTAM_ID","reason":"raison courte"}]}
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
                return ['blocking' => [], 'informational' => [], 'raw_response' => $raw];
            }

            return [
                'blocking' => $parsed['blocking'] ?? [],
                'informational' => $parsed['informational'] ?? [],
            ];
        } catch (\Throwable $e) {
            $this->logger->error('Kimi NOTAM classification failed', ['error' => $e->getMessage()]);
            return ['blocking' => [], 'informational' => [], 'error' => $e->getMessage()];
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
