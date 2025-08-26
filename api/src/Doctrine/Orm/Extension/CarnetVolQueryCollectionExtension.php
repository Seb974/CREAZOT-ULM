<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Extension;

use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\CarnetVol;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Restrict CarnetVol collection to current user.
 */
final readonly class CarnetVolQueryCollectionExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security, private  AuthorizationCheckerInterface $auth)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if (
            CarnetVol::class !== $resourceClass
            || "_api_/carnet_vols{._format}_get_collection" !== $operation->getName()
            || !$user = $this->security->getUser()
        ) {
            return;
        }

        $queryBuilder
            ->join(\sprintf('%s.profil', $queryBuilder->getRootAliases()[0]), 'pfl')
            ->join('pfl.pilote', 'plt')
            ->where('plt = :user')
            ->setParameter('user', $user);
    }
}
