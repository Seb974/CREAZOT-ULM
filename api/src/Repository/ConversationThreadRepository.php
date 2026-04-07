<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ConversationThread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ConversationThreadRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ConversationThread::class);
    }

    public function findActiveByCustomerEmail(string $email, int $clientId): ?ConversationThread
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.customerEmail = :email')
            ->andWhere('t.client = :clientId')
            ->andWhere('t.status NOT IN (:closedStatuses)')
            ->setParameter('email', $email)
            ->setParameter('clientId', $clientId)
            ->setParameter('closedStatuses', ['confirmed', 'cancelled', 'expired'])
            ->orderBy('t.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findActiveByCustomerPhone(string $phone, int $clientId): ?ConversationThread
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.customerPhone = :phone')
            ->andWhere('t.client = :clientId')
            ->andWhere('t.status NOT IN (:closedStatuses)')
            ->setParameter('phone', $phone)
            ->setParameter('clientId', $clientId)
            ->setParameter('closedStatuses', ['confirmed', 'cancelled', 'expired'])
            ->orderBy('t.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPendingValidation(int $clientId): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.client = :clientId')
            ->andWhere('t.status = :status')
            ->setParameter('clientId', $clientId)
            ->setParameter('status', 'awaiting_club')
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countByStatus(int $clientId): array
    {
        $rows = $this->createQueryBuilder('t')
            ->select('t.status, COUNT(t.id) as cnt')
            ->andWhere('t.client = :clientId')
            ->setParameter('clientId', $clientId)
            ->groupBy('t.status')
            ->getQuery()
            ->getResult();

        $counts = [];
        foreach ($rows as $row) {
            $counts[$row['status']] = (int) $row['cnt'];
        }

        return $counts;
    }
}
