<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ClientAccessRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ClientAccessRequest>
 */
class ClientAccessRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ClientAccessRequest::class);
    }
}
