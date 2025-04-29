<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Extension;

use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Vol;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Restrict Vol collection to current user.
 */
final readonly class VolQueryCollectionExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security, private  AuthorizationCheckerInterface $auth)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if (
            Vol::class !== $resourceClass
            || '_api_/vols{._format}_get_collection' !== $operation->getName()
            || !$user = $this->security->getUser()
        ) {
            return;
        }

        if (!$this->auth->isGranted('OIDC_ADMIN')) {
            $queryBuilder
                ->leftJoin(\sprintf('%s.prestation', $queryBuilder->getRootAliases()[0]), 'p')
                ->leftJoin('p.pilote', 'pilote')
                ->andWhere('pilote = :user')
                ->setParameter('user', $user);
        }
    }
}
