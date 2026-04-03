<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\NotamCache;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<NotamCache>
 */
class NotamCacheRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NotamCache::class);
    }

    public function findFresh(string $icao): ?NotamCache
    {
        $cache = $this->find(strtoupper(trim($icao)));

        if ($cache && $cache->isFresh()) {
            return $cache;
        }

        return null;
    }

    public function upsert(string $icao, array $data): NotamCache
    {
        $icao = strtoupper(trim($icao));
        $cache = $this->find($icao);

        if (!$cache) {
            $cache = new NotamCache();
            $cache->setIcao($icao);
        }

        $cache->setFetchedAt(new \DateTime('today'));
        $cache->setData($data);

        $this->getEntityManager()->persist($cache);
        $this->getEntityManager()->flush();

        return $cache;
    }
}
