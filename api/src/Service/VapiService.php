<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\SiteSettingsRepository;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class VapiService
{
    private const API_BASE = 'https://api.vapi.ai';

    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
        private LoggerInterface $logger,
    ) {}

    private function getApiKey(): string
    {
        $settings = $this->siteSettingsRepo->findInstance();
        $key = $settings?->getVapiApiKey();

        if (!$key) {
            throw new \RuntimeException('Clé API Vapi non configurée. Rendez-vous dans Paramétrage SaaS.');
        }

        return $key;
    }

    public function createAssistant(string $clubName, string $serverUrl, int $clientId): array
    {
        $systemPrompt = $this->buildAssistantPrompt($clubName, $clientId);

        $body = [
            'name' => "Assistant réservation — {$clubName}",
            'firstMessage' => "Bonjour ! Bienvenue chez {$clubName}. Je suis votre assistant de réservation. Comment puis-je vous aider aujourd'hui ?",
            'transcriber' => [
                'provider' => 'deepgram',
                'model' => 'nova-3',
                'language' => 'fr',
            ],
            'model' => [
                'provider' => 'openai',
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                ],
                'tools' => $this->buildTools($serverUrl),
            ],
            'voice' => [
                'provider' => 'elevenlabs',
                'voiceId' => 'sarah',
            ],
            'serverUrl' => $serverUrl,
            'endCallMessage' => "Merci pour votre appel ! À très bientôt chez {$clubName}. Bon vol !",
        ];

        return $this->request('POST', '/assistant', $body);
    }

    public function updateAssistant(string $assistantId, string $clubName, string $serverUrl, int $clientId): array
    {
        $systemPrompt = $this->buildAssistantPrompt($clubName, $clientId);

        $body = [
            'name' => "Assistant réservation — {$clubName}",
            'firstMessage' => "Bonjour ! Bienvenue chez {$clubName}. Je suis votre assistant de réservation. Comment puis-je vous aider aujourd'hui ?",
            'model' => [
                'provider' => 'openai',
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                ],
                'tools' => $this->buildTools($serverUrl),
            ],
            'serverUrl' => $serverUrl,
        ];

        return $this->request('PATCH', "/assistant/{$assistantId}", $body);
    }

    public function listAssistants(): array
    {
        return $this->request('GET', '/assistant');
    }

    public function getAssistant(string $assistantId): array
    {
        return $this->request('GET', "/assistant/{$assistantId}");
    }

    public function listPhoneNumbers(): array
    {
        return $this->request('GET', '/phone-number');
    }

    public function listCalls(int $limit = 20): array
    {
        return $this->request('GET', "/call?limit={$limit}");
    }

    private function buildAssistantPrompt(string $clubName, int $clientId): string
    {
        return <<<PROMPT
Tu es l'assistant téléphonique de réservation du club "{$clubName}", spécialisé en vol ULM et aviation légère.

=== TON RÔLE ===
- Accueillir chaleureusement les appelants
- Comprendre leur demande de réservation
- Vérifier les disponibilités via l'outil check_availability
- Proposer des créneaux disponibles
- Confirmer la réservation via l'outil confirm_reservation
- Répondre aux questions générales sur les prestations via list_services

=== RÈGLES ===
1. Parle TOUJOURS en français
2. Sois chaleureux, professionnel et concis
3. Pour réserver, tu as besoin de : la prestation souhaitée, la date, et le nom du client
4. Si une info manque, demande-la naturellement
5. Utilise TOUJOURS client_id = {$clientId} dans tes appels d'outils
6. Quand tu proposes des créneaux, lis-les clairement un par un
7. Attends la confirmation du client avant d'appeler confirm_reservation
8. Si aucun créneau n'est disponible, propose une autre date
9. Ne parle jamais de détails techniques (IDs, codes internes)
10. Termine toujours en souhaitant un bon vol

=== EXEMPLES DE DIALOGUE ===
Client : "Bonjour, j'aimerais faire un baptême de l'air samedi prochain"
Toi : "Avec plaisir ! Laissez-moi vérifier les disponibilités pour un baptême de l'air samedi. Un instant..."
[Appel check_availability]
Toi : "Bonne nouvelle ! J'ai plusieurs créneaux disponibles samedi. Je peux vous proposer 10h, 11h30 ou 14h. Quel horaire vous conviendrait le mieux ?"
PROMPT;
    }

    private function buildTools(string $serverUrl): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'check_availability',
                    'description' => 'Vérifie les créneaux disponibles pour une prestation à une date donnée',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'client_id' => ['type' => 'integer', 'description' => 'ID du club'],
                            'circuit_code' => ['type' => 'string', 'description' => 'Code ou nom de la prestation'],
                            'date' => ['type' => 'string', 'description' => 'Date au format YYYY-MM-DD'],
                        ],
                        'required' => ['client_id', 'circuit_code', 'date'],
                    ],
                ],
                'async' => false,
                'server' => ['url' => $serverUrl],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'confirm_reservation',
                    'description' => "Confirme et crée la réservation pour le client. N'appeler qu'après confirmation explicite du client.",
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'client_id' => ['type' => 'integer', 'description' => 'ID du club'],
                            'circuit_code' => ['type' => 'string', 'description' => 'Code de la prestation'],
                            'date' => ['type' => 'string', 'description' => 'Date au format YYYY-MM-DD'],
                            'time' => ['type' => 'string', 'description' => 'Heure au format HH:MM'],
                            'customer_name' => ['type' => 'string', 'description' => 'Nom complet du client'],
                            'customer_phone' => ['type' => 'string', 'description' => 'Numéro de téléphone du client'],
                            'quantity' => ['type' => 'integer', 'description' => 'Nombre de personnes'],
                        ],
                        'required' => ['client_id', 'circuit_code', 'date', 'time', 'customer_name'],
                    ],
                ],
                'async' => false,
                'server' => ['url' => $serverUrl],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'list_services',
                    'description' => 'Liste toutes les prestations disponibles du club avec prix et durées',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'client_id' => ['type' => 'integer', 'description' => 'ID du club'],
                        ],
                        'required' => ['client_id'],
                    ],
                ],
                'async' => false,
                'server' => ['url' => $serverUrl],
            ],
        ];
    }

    private function request(string $method, string $endpoint, ?array $body = null): array
    {
        $apiKey = $this->getApiKey();

        $options = [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ],
        ];

        if ($body !== null) {
            $options['json'] = $body;
        }

        try {
            $response = $this->httpClient->request($method, self::API_BASE . $endpoint, $options);
            return $response->toArray(false);
        } catch (\Throwable $e) {
            $this->logger->error('Vapi API error: {error}', ['error' => $e->getMessage()]);
            throw new \RuntimeException('Erreur Vapi : ' . $e->getMessage());
        }
    }
}
