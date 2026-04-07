<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ConversationThread;
use App\Entity\Reservation;
use App\Repository\ConversationThreadRepository;
use App\Service\AvailabilityService;
use App\Service\ConversationManager;
use App\Service\ReservationAiService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class AiReservationController extends AbstractController
{
    public function __construct(
        private ReservationAiService $aiService,
        private ConversationManager $conversationManager,
        private ConversationThreadRepository $threadRepo,
        private AvailabilityService $availabilityService,
        private EntityManagerInterface $em,
    ) {}

    #[Route('/admin/ai-reservation/webhook/email', name: 'ai_reservation_email_webhook', methods: ['POST'])]
    public function emailWebhook(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $from = $data['from'] ?? null;
        $body = $data['body'] ?? '';
        $subject = $data['subject'] ?? '';
        $name = $data['fromName'] ?? null;
        $messageId = $data['messageId'] ?? null;
        $clientId = $data['clientId'] ?? null;

        if (!$from || !$body) {
            return new JsonResponse(['error' => 'Champs "from" et "body" requis.'], 400);
        }

        $client = $clientId ? $this->em->getRepository(\App\Entity\Client::class)->find($clientId) : null;
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé.'], 404);
        }

        $thread = $this->conversationManager->findOrCreateThread('email', $client, $from, null, $name);

        if ($messageId) {
            $thread->setExternalConversationId($messageId);
            $this->em->flush();
        }

        $response = $this->aiService->processMessage($thread, $body);

        return new JsonResponse([
            'threadId' => $thread->getId(),
            'status' => $thread->getStatus(),
            'response' => $response,
        ]);
    }

    #[Route('/admin/ai-reservation/conversations/{id}/validate', name: 'ai_reservation_validate', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function validateReservation(int $id, Request $request): JsonResponse
    {
        $thread = $this->threadRepo->find($id);
        if (!$thread) {
            return new JsonResponse(['error' => 'Conversation non trouvée.'], 404);
        }

        $context = $thread->getAiContext() ?? [];
        $extracted = $context['extracted'] ?? [];
        $proposedSlots = $context['proposed_slots'] ?? [];
        $circuitId = $context['circuit_id'] ?? null;

        $data = json_decode($request->getContent(), true) ?? [];
        $slotIndex = $data['slotIndex'] ?? 0;

        if (empty($proposedSlots)) {
            return new JsonResponse(['error' => 'Aucun créneau proposé dans cette conversation.'], 400);
        }

        $slot = $proposedSlots[$slotIndex] ?? $proposedSlots[0];

        $reservation = new Reservation();
        $reservation->setNom($extracted['customer_name'] ?? $thread->getCustomerName());
        $reservation->setEmail($thread->getCustomerEmail());
        $reservation->setTelephone($thread->getCustomerPhone());
        $reservation->setStatut('confirmé');
        $reservation->setDebut(new \DateTime($slot['debut']));
        $reservation->setFin(new \DateTime($slot['fin']));
        $reservation->setPrix($slot['prix'] ?? null);
        $reservation->setQuantite($extracted['quantity'] ?? 1);
        $reservation->setRemarques('Réservation créée via assistant IA (' . $thread->getChannel() . ')');

        if ($circuitId) {
            $circuit = $this->em->getRepository(\App\Entity\Circuit::class)->find($circuitId);
            if ($circuit) {
                $reservation->setCircuit($circuit);
            }
        }

        $client = $thread->getClient();
        if ($client) {
            $reservation->setClient($client);
        }

        $this->em->persist($reservation);
        $this->conversationManager->linkReservation($thread, $reservation);

        return new JsonResponse([
            'success' => true,
            'reservationId' => $reservation->getId(),
            'threadId' => $thread->getId(),
        ]);
    }

    #[Route('/admin/ai-reservation/conversations/{id}/cancel', name: 'ai_reservation_cancel', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function cancelConversation(int $id): JsonResponse
    {
        $thread = $this->threadRepo->find($id);
        if (!$thread) {
            return new JsonResponse(['error' => 'Conversation non trouvée.'], 404);
        }

        $this->conversationManager->cancel($thread);

        return new JsonResponse(['success' => true, 'status' => 'cancelled']);
    }

    #[Route('/admin/ai-reservation/stats', name: 'ai_reservation_stats', methods: ['GET'])]
    public function stats(Request $request): JsonResponse
    {
        $clientId = (int) $request->query->get('clientId', 0);
        if (!$clientId) {
            return new JsonResponse(['error' => 'clientId requis.'], 400);
        }

        $counts = $this->conversationManager->getStats($clientId);

        return new JsonResponse([
            'pending' => $counts['pending'] ?? 0,
            'analyzing' => $counts['analyzing'] ?? 0,
            'proposing' => $counts['proposing'] ?? 0,
            'awaiting_customer' => $counts['awaiting_customer'] ?? 0,
            'awaiting_club' => $counts['awaiting_club'] ?? 0,
            'confirmed' => $counts['confirmed'] ?? 0,
            'cancelled' => $counts['cancelled'] ?? 0,
            'total' => array_sum($counts),
        ]);
    }
}
