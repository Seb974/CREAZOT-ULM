<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\IcaoReference;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<IcaoReference>
 */
class IcaoReferenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IcaoReference::class);
    }

    public function isValid(string $icao): bool
    {
        return $this->find(strtoupper(trim($icao))) !== null;
    }
}
