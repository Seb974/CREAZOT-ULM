<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use App\Entity\ConversationThread;
use App\Entity\Reservation;
use App\Repository\ConversationThreadRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class ConversationManager
{
    public function __construct(
        private EntityManagerInterface $em,
        private ConversationThreadRepository $threadRepo,
        private LoggerInterface $logger,
    ) {}

    public function createThread(
        string $channel,
        Client $client,
        ?string $customerName = null,
        ?string $customerEmail = null,
        ?string $customerPhone = null,
    ): ConversationThread {
        $thread = new ConversationThread();
        $thread->setChannel($channel);
        $thread->setClient($client);
        $thread->setCustomerName($customerName);
        $thread->setCustomerEmail($customerEmail);
        $thread->setCustomerPhone($customerPhone);
        $thread->setStatus('pending');

        $this->em->persist($thread);
        $this->em->flush();

        $this->logger->info('New conversation thread #{id} ({channel}) for client {client}', [
            'id' => $thread->getId(),
            'channel' => $channel,
            'client' => $client->getName(),
        ]);

        return $thread;
    }

    public function findOrCreateThread(
        string $channel,
        Client $client,
        ?string $email = null,
        ?string $phone = null,
        ?string $name = null,
    ): ConversationThread {
        $existing = null;

        if ($email) {
            $existing = $this->threadRepo->findActiveByCustomerEmail($email, $client->getId());
        }
        if (!$existing && $phone) {
            $existing = $this->threadRepo->findActiveByCustomerPhone($phone, $client->getId());
        }

        if ($existing) {
            $this->logger->debug('Reusing thread #{id} for {email}', [
                'id' => $existing->getId(),
                'email' => $email ?? $phone,
            ]);
            return $existing;
        }

        return $this->createThread($channel, $client, $name, $email, $phone);
    }

    public function updateStatus(ConversationThread $thread, string $newStatus): void
    {
        $old = $thread->getStatus();
        $thread->setStatus($newStatus);
        $this->em->flush();

        $this->logger->info('Thread #{id} status: {old} → {new}', [
            'id' => $thread->getId(),
            'old' => $old,
            'new' => $newStatus,
        ]);
    }

    public function updateContext(ConversationThread $thread, array $contextUpdate): void
    {
        $thread->mergeAiContext($contextUpdate);
        $this->em->flush();
    }

    public function updateSummary(ConversationThread $thread, string $summary): void
    {
        $thread->setSummary($summary);
        $this->em->flush();
    }

    public function linkReservation(ConversationThread $thread, Reservation $reservation): void
    {
        $thread->setReservation($reservation);
        $this->updateStatus($thread, 'confirmed');

        $this->logger->info('Thread #{id} linked to reservation #{resaId}', [
            'id' => $thread->getId(),
            'resaId' => $reservation->getId(),
        ]);
    }

    public function cancel(ConversationThread $thread): void
    {
        $this->updateStatus($thread, 'cancelled');
    }

    public function expire(ConversationThread $thread): void
    {
        $this->updateStatus($thread, 'expired');
    }

    public function getStats(int $clientId): array
    {
        return $this->threadRepo->countByStatus($clientId);
    }
}
