<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\PaymentDetail;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PaymentDetail>
 */
class PaymentDetailRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PaymentDetail::class);
    }

    //    /**
    //     * @return PaymentDetail[] Returns an array of PaymentDetail objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?PaymentDetail
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
