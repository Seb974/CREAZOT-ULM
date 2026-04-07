<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use App\Entity\Circuit;
use App\Entity\ConversationThread;
use Psr\Log\LoggerInterface;

class ReservationAiService
{
    public function __construct(
        private KimiAiService $kimi,
        private AvailabilityService $availability,
        private ConversationManager $conversationManager,
        private LoggerInterface $logger,
    ) {}

    public function processMessage(ConversationThread $thread, string $customerMessage): string
    {
        $client = $thread->getClient();
        if (!$client) {
            throw new \RuntimeException('Thread sans client associé.');
        }

        try {
            $circuits = $this->availability->getAvailableCircuits($client);
            $currentContext = $thread->getAiContext() ?? [];

            $systemPrompt = $this->buildSystemPrompt($client, $circuits, $currentContext);

            $conversationForAi = $this->buildConversationSummary($currentContext, $customerMessage);

            $rawResponse = $this->kimi->chat($systemPrompt, $conversationForAi);

            $parsed = $this->parseAiResponse($rawResponse);

            $responseText = $parsed['response_to_customer'] ?? $rawResponse;
            $action = $parsed['action'] ?? 'need_more_info';
            $extracted = $parsed['extracted'] ?? [];

            if (!empty($extracted)) {
                $this->conversationManager->updateContext($thread, ['extracted' => $extracted]);
            }

            if (isset($parsed['summary'])) {
                $this->conversationManager->updateSummary($thread, $parsed['summary']);
            }

            if ($action === 'search_availability' && !empty($extracted['circuit_code']) && !empty($extracted['preferred_date'])) {
                $responseText = $this->handleAvailabilitySearch($thread, $client, $circuits, $extracted, $customerMessage);
            } elseif ($action === 'confirm_slot') {
                $this->conversationManager->updateStatus($thread, 'awaiting_club');
                $this->conversationManager->updateContext($thread, ['confirmed_by_customer' => true]);
            } elseif ($action === 'escalate_to_human') {
                $this->conversationManager->updateStatus($thread, 'awaiting_club');
            } elseif ($thread->getStatus() === 'pending') {
                $this->conversationManager->updateStatus($thread, 'analyzing');
            }

            return $responseText;

        } catch (\Throwable $e) {
            $this->logger->error('AI processing failed for thread #{id}: {error}', [
                'id' => $thread->getId(),
                'error' => $e->getMessage(),
            ]);

            return "Merci pour votre message. Notre équipe va vous recontacter rapidement pour organiser votre réservation. À bientôt !";
        }
    }

    private function handleAvailabilitySearch(
        ConversationThread $thread,
        Client $client,
        array $circuits,
        array $extracted,
        string $originalMessage,
    ): string {
        $circuitCode = $extracted['circuit_code'];
        $circuit = $this->findCircuitByCode($circuits, $circuitCode);

        if (!$circuit) {
            return "Je n'ai pas trouvé la prestation \"{$circuitCode}\" dans notre catalogue. Voici nos prestations disponibles :\n\n"
                . $this->formatCircuitCatalog($circuits)
                . "\n\nLaquelle vous intéresse ?";
        }

        try {
            $date = new \DateTime($extracted['preferred_date']);
        } catch (\Exception $e) {
            return "Je n'ai pas bien compris la date souhaitée. Pouvez-vous me préciser le jour qui vous conviendrait ? (par exemple : samedi 12 avril)";
        }

        $slots = $this->availability->findAvailableSlots($client, $circuit, $date, 5);

        if (empty($slots)) {
            return "Malheureusement, il n'y a pas de créneau disponible pour {$circuit->getNom()} le {$date->format('d/m/Y')}. "
                . "Souhaitez-vous essayer une autre date ?";
        }

        $this->conversationManager->updateStatus($thread, 'proposing');
        $this->conversationManager->updateContext($thread, [
            'proposed_slots' => array_map(fn($s) => [
                'debut' => $s['debut']->format('Y-m-d H:i'),
                'fin' => $s['fin']->format('Y-m-d H:i'),
                'aeronef' => $s['aeronef']->getImmatriculation(),
                'prix' => $s['prix'],
            ], $slots),
            'circuit_id' => $circuit->getId(),
        ]);

        $slotsText = $this->formatSlotsForCustomer($slots, $circuit);

        $systemPrompt = <<<PROMPT
Tu es l'assistant de réservation du club {$client->getName()}.
Le client a demandé un vol "{$circuit->getNom()}" le {$date->format('d/m/Y')}.
Voici les créneaux disponibles trouvés. Présente-les de manière chaleureuse et professionnelle au client.
Demande-lui quel créneau il préfère.
Réponds UNIQUEMENT en français.
PROMPT;

        try {
            return $this->kimi->chat($systemPrompt, "Créneaux trouvés :\n{$slotsText}\n\nMessage original du client : {$originalMessage}");
        } catch (\Throwable $e) {
            return "Bonne nouvelle ! Voici les créneaux disponibles pour {$circuit->getNom()} le {$date->format('d/m/Y')} :\n\n{$slotsText}\n\nQuel créneau vous conviendrait le mieux ?";
        }
    }

    private function buildSystemPrompt(Client $client, array $circuits, array $currentContext): string
    {
        $circuitList = $this->formatCircuitCatalog($circuits);
        $contextInfo = !empty($currentContext) ? json_encode($currentContext, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : 'Aucun';
        $clubName = $client->getName() ?? 'notre club';

        return <<<PROMPT
Tu es l'assistant de réservation IA de "{$clubName}", un club de vol ULM / aviation légère.
Tu gères les demandes de réservation de vols par email et téléphone.

=== TES PRESTATIONS ===
{$circuitList}

=== CONTEXTE CONVERSATION EN COURS ===
{$contextInfo}

=== TES INSTRUCTIONS ===
1. Comprends l'intention du client (réserver un vol, demander des infos, annuler, autre)
2. Si le client veut réserver, extrais : la prestation souhaitée, la date préférée, l'heure souhaitée, le nombre de personnes, son nom
3. Si des informations manquent, demande-les naturellement
4. Sois chaleureux, professionnel, et concis
5. Réponds TOUJOURS en français

=== FORMAT DE RÉPONSE ===
Réponds en JSON valide (sans markdown) :
{
  "response_to_customer": "Le texte à envoyer au client",
  "intent": "booking|inquiry|cancel|other",
  "extracted": {
    "circuit_code": "code de la prestation ou null",
    "preferred_date": "YYYY-MM-DD ou null",
    "preferred_time": "HH:MM ou null",
    "quantity": nombre_ou_null,
    "customer_name": "nom ou null"
  },
  "action": "search_availability|confirm_slot|need_more_info|escalate_to_human",
  "summary": "Résumé en une phrase de la conversation"
}

Si tu ne peux pas répondre en JSON, réponds en texte libre (ce sera traité comme action "need_more_info").
PROMPT;
    }

    private function buildConversationSummary(array $currentContext, string $newMessage): string
    {
        $parts = [];

        if (!empty($currentContext['extracted'])) {
            $parts[] = "Informations déjà collectées : " . json_encode($currentContext['extracted'], JSON_UNESCAPED_UNICODE);
        }

        if (!empty($currentContext['proposed_slots'])) {
            $parts[] = "Créneaux déjà proposés au client : " . json_encode($currentContext['proposed_slots'], JSON_UNESCAPED_UNICODE);
        }

        $parts[] = "Nouveau message du client :\n{$newMessage}";

        return implode("\n\n", $parts);
    }

    private function parseAiResponse(string $rawResponse): array
    {
        $raw = trim($rawResponse);

        if (str_starts_with($raw, '```')) {
            $raw = preg_replace('/^```(?:json)?\s*/i', '', $raw);
            $raw = preg_replace('/\s*```$/', '', $raw);
        }

        $parsed = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->logger->debug('AI response is not JSON, treating as plain text');
            return [
                'response_to_customer' => $rawResponse,
                'intent' => 'other',
                'extracted' => [],
                'action' => 'need_more_info',
            ];
        }

        return $parsed;
    }

    private function formatCircuitCatalog(array $circuits): string
    {
        if (empty($circuits)) {
            return 'Aucune prestation configurée.';
        }

        $lines = [];
        foreach ($circuits as $c) {
            $duree = $c->getDuree() ? $c->getDuree()->format('H\hi') : '?';
            $prix = $c->getPrix() ? number_format($c->getPrix(), 2, ',', ' ') . ' €' : 'sur devis';
            $nature = $c->getNature() ? $c->getNature()->getLabel() : '';
            $lines[] = "- [{$c->getCode()}] {$c->getNom()} — Durée : {$duree} — Prix : {$prix}" . ($nature ? " — {$nature}" : '');
        }

        return implode("\n", $lines);
    }

    private function formatSlotsForCustomer(array $slots, Circuit $circuit): string
    {
        $lines = [];
        foreach ($slots as $i => $slot) {
            $num = $i + 1;
            $debut = $slot['debut']->format('H\hi');
            $fin = $slot['fin']->format('H\hi');
            $prix = number_format($slot['prix'], 2, ',', ' ');
            $lines[] = "{$num}. {$debut} → {$fin} — {$prix} €";
        }

        return implode("\n", $lines);
    }

    /**
     * @param Circuit[] $circuits
     */
    private function findCircuitByCode(array $circuits, string $code): ?Circuit
    {
        $code = strtoupper(trim($code));
        foreach ($circuits as $c) {
            if (strtoupper($c->getCode() ?? '') === $code) {
                return $c;
            }
        }
        foreach ($circuits as $c) {
            if (str_contains(strtoupper($c->getNom() ?? ''), $code)) {
                return $c;
            }
        }
        return null;
    }
}
