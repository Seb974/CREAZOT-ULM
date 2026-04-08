<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Reservation;
use App\Repository\ConversationThreadRepository;
use App\Service\AvailabilityService;
use App\Service\ConversationManager;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class VapiWebhookController extends AbstractController
{
    public function __construct(
        private AvailabilityService $availabilityService,
        private ConversationManager $conversationManager,
        private ConversationThreadRepository $threadRepo,
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {}

    #[Route('/webhook/vapi', name: 'vapi_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        if (!$payload || !isset($payload['message']['type'])) {
            return new JsonResponse(['error' => 'Invalid payload'], 400);
        }

        $type = $payload['message']['type'];

        return match ($type) {
            'tool-calls' => $this->handleToolCalls($payload),
            'end-of-call-report' => $this->handleEndOfCall($payload),
            'status-update' => $this->handleStatusUpdate($payload),
            'assistant-request' => $this->handleAssistantRequest($payload),
            default => new JsonResponse(['ok' => true]),
        };
    }

    private function handleToolCalls(array $payload): JsonResponse
    {
        $toolCallList = $payload['message']['toolCallList'] ?? [];
        $results = [];

        foreach ($toolCallList as $toolCall) {
            $name = $toolCall['name'] ?? '';
            $params = $toolCall['parameters'] ?? [];
            $callId = $toolCall['id'] ?? '';

            $result = match ($name) {
                'check_availability' => $this->toolCheckAvailability($params, $payload),
                'confirm_reservation' => $this->toolConfirmReservation($params, $payload),
                'list_services' => $this->toolListServices($params),
                default => "Outil non reconnu : {$name}",
            };

            $results[] = [
                'toolCallId' => $callId,
                'result' => is_string($result) ? $result : json_encode($result, JSON_UNESCAPED_UNICODE),
            ];
        }

        return new JsonResponse(['results' => $results]);
    }

    private function toolCheckAvailability(array $params, array $payload): string
    {
        $clientId = (int) ($params['client_id'] ?? 0);
        $circuitCode = $params['circuit_code'] ?? '';
        $dateStr = $params['date'] ?? '';

        if (!$clientId || !$circuitCode || !$dateStr) {
            return "Paramètres manquants. J'ai besoin du client_id, circuit_code et date.";
        }

        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return "Client non trouvé.";
        }

        $circuits = $this->availabilityService->getAvailableCircuits($client);
        $circuit = null;
        $code = strtoupper(trim($circuitCode));
        foreach ($circuits as $c) {
            if (strtoupper($c->getCode() ?? '') === $code || str_contains(strtoupper($c->getNom() ?? ''), $code)) {
                $circuit = $c;
                break;
            }
        }

        if (!$circuit) {
            $available = array_map(fn($c) => "{$c->getCode()} ({$c->getNom()})", $circuits);
            return "Prestation \"{$circuitCode}\" non trouvée. Prestations disponibles : " . implode(', ', $available);
        }

        try {
            $date = new \DateTime($dateStr);
        } catch (\Exception $e) {
            return "Date invalide : \"{$dateStr}\". Format attendu : YYYY-MM-DD.";
        }

        $slots = $this->availabilityService->findAvailableSlots($client, $circuit, $date, 5);

        if (empty($slots)) {
            return "Aucun créneau disponible pour {$circuit->getNom()} le {$date->format('d/m/Y')}. Proposez une autre date au client.";
        }

        $this->trackConversation($payload, $client, [
            'circuit_id' => $circuit->getId(),
            'circuit_code' => $circuit->getCode(),
            'date' => $dateStr,
            'proposed_slots' => array_map(fn($s) => [
                'debut' => $s['debut']->format('Y-m-d H:i'),
                'fin' => $s['fin']->format('Y-m-d H:i'),
                'aeronef' => $s['aeronef']->getImmatriculation(),
                'prix' => $s['prix'],
            ], $slots),
        ]);

        $lines = [];
        foreach ($slots as $i => $slot) {
            $num = $i + 1;
            $lines[] = "Créneau {$num} : {$slot['debut']->format('H\\hi')} à {$slot['fin']->format('H\\hi')} — {$slot['prix']} €";
        }

        return "Créneaux disponibles pour {$circuit->getNom()} le {$date->format('d/m/Y')} :\n" . implode("\n", $lines)
            . "\n\nDemandez au client quel créneau il préfère.";
    }

    private function toolConfirmReservation(array $params, array $payload): string
    {
        $clientId = (int) ($params['client_id'] ?? 0);
        $circuitCode = $params['circuit_code'] ?? '';
        $dateStr = $params['date'] ?? '';
        $timeStr = $params['time'] ?? '';
        $customerName = $params['customer_name'] ?? '';
        $customerPhone = $params['customer_phone'] ?? '';
        $quantity = (int) ($params['quantity'] ?? 1);

        if (!$clientId || !$circuitCode || !$dateStr || !$timeStr || !$customerName) {
            return "Informations insuffisantes pour confirmer. J'ai besoin de : client_id, circuit_code, date, time, customer_name.";
        }

        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return "Client non trouvé.";
        }

        $circuits = $this->availabilityService->getAvailableCircuits($client);
        $circuit = null;
        $code = strtoupper(trim($circuitCode));
        foreach ($circuits as $c) {
            if (strtoupper($c->getCode() ?? '') === $code) {
                $circuit = $c;
                break;
            }
        }

        if (!$circuit) {
            return "Prestation \"{$circuitCode}\" non trouvée.";
        }

        try {
            $debut = new \DateTime("{$dateStr} {$timeStr}");
        } catch (\Exception $e) {
            return "Date/heure invalide.";
        }

        $durationMinutes = 0;
        if ($circuit->getDuree()) {
            $durationMinutes = (int) $circuit->getDuree()->format('H') * 60 + (int) $circuit->getDuree()->format('i');
        }
        $fin = (clone $debut)->modify("+{$durationMinutes} minutes");

        $check = $this->availabilityService->isSlotAvailable($client, $circuit, $debut, $fin);
        if ($check === false) {
            return "Ce créneau n'est plus disponible. Veuillez vérifier les disponibilités à nouveau.";
        }

        $reservation = new Reservation();
        $reservation->setClient($client);
        $reservation->setNom($customerName);
        $reservation->setTelephone($customerPhone ?: null);
        $reservation->setCircuit($circuit);
        $reservation->setDebut($debut);
        $reservation->setFin($fin);
        $reservation->setAvion($check['aeronef']);
        $reservation->setPilote($check['pilote']->getPilote());
        $reservation->setPrix($circuit->getPrix());
        $reservation->setQuantite($quantity);
        $reservation->setStatut('confirmé');
        $reservation->setRemarques('Réservation créée via assistant vocal IA (Vapi)');

        $this->em->persist($reservation);

        $thread = $this->trackConversation($payload, $client, [
            'confirmed' => true,
            'reservation_debut' => $debut->format('Y-m-d H:i'),
        ]);
        if ($thread) {
            $this->conversationManager->linkReservation($thread, $reservation);
        } else {
            $this->em->flush();
        }

        $this->logger->info('Vapi: reservation created #{id} for {name}', [
            'id' => $reservation->getId(),
            'name' => $customerName,
        ]);

        return "Réservation confirmée ! {$circuit->getNom()} le {$debut->format('d/m/Y')} de {$debut->format('H\\hi')} à {$fin->format('H\\hi')} pour {$customerName}. Machine : {$check['aeronef']->getImmatriculation()}.";
    }

    private function toolListServices(array $params): string
    {
        $clientId = (int) ($params['client_id'] ?? 0);
        if (!$clientId) {
            return "client_id requis.";
        }

        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return "Client non trouvé.";
        }

        $circuits = $this->availabilityService->getAvailableCircuits($client);
        if (empty($circuits)) {
            return "Aucune prestation configurée pour ce club.";
        }

        $lines = [];
        foreach ($circuits as $c) {
            $duree = $c->getDuree() ? $c->getDuree()->format('H\\hi') : '?';
            $prix = $c->getPrix() ? number_format($c->getPrix(), 2, ',', ' ') . ' €' : 'sur devis';
            $lines[] = "- {$c->getCode()} : {$c->getNom()} — Durée : {$duree} — Prix : {$prix}";
        }

        return "Voici nos prestations :\n" . implode("\n", $lines);
    }

    private function handleEndOfCall(array $payload): JsonResponse
    {
        $call = $payload['message']['call'] ?? [];
        $callId = $call['id'] ?? 'unknown';
        $duration = $call['duration'] ?? 0;
        $summary = $payload['message']['summary'] ?? null;
        $transcript = $payload['message']['transcript'] ?? null;

        $this->logger->info('Vapi: call ended #{callId}, duration: {duration}s', [
            'callId' => $callId,
            'duration' => $duration,
        ]);

        $thread = $this->threadRepo->findOneBy(['externalConversationId' => $callId]);
        if ($thread && $summary) {
            $this->conversationManager->updateSummary($thread, $summary);
        }

        return new JsonResponse(['ok' => true]);
    }

    private function handleStatusUpdate(array $payload): JsonResponse
    {
        return new JsonResponse(['ok' => true]);
    }

    private function handleAssistantRequest(array $payload): JsonResponse
    {
        return new JsonResponse(['ok' => true]);
    }

    private function trackConversation(array $payload, Client $client, array $contextUpdate): ?\App\Entity\ConversationThread
    {
        $call = $payload['message']['call'] ?? [];
        $callId = $call['id'] ?? null;
        $customerPhone = $call['customer']['number'] ?? null;

        if (!$callId) {
            return null;
        }

        $thread = $this->threadRepo->findOneBy(['externalConversationId' => $callId]);

        if (!$thread) {
            $thread = $this->conversationManager->createThread('voice', $client, null, null, $customerPhone);
            $thread->setExternalConversationId($callId);
            $this->em->flush();
        }

        $this->conversationManager->updateContext($thread, $contextUpdate);

        return $thread;
    }
}
