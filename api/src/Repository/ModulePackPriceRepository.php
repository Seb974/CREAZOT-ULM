<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ModulePackPrice;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ModulePackPrice>
 */
class ModulePackPriceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ModulePackPrice::class);
    }
}
