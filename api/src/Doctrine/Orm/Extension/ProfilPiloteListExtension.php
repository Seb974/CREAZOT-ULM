<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Extension;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\ProfilPilote;
use Doctrine\ORM\QueryBuilder;

class ProfilPiloteListExtension implements QueryCollectionExtensionInterface
{
    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($resourceClass !== ProfilPilote::class) {
            return;
        }

        if ($operation?->getName() !== 'profil_pilotes_list') {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        $queryBuilder
            ->leftJoin($rootAlias . '.pilote', 'pilote')
            ->addSelect('pilote')
            ->leftJoin('pilote.clients', 'clients')
            ->addSelect('clients')
            ->leftJoin($rootAlias . '.pilotQualifications', 'pq')
            ->addSelect('pq')
            ->leftJoin('pq.qualification', 'qual')
            ->addSelect('qual');
    }
}
