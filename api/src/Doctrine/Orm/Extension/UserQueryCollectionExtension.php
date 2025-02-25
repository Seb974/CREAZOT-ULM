<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Extension;

use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Restrict User collection to current user.
 */
final readonly class UserQueryCollectionExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security, private  AuthorizationCheckerInterface $auth)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if (
            User::class !== $resourceClass
            || '_api_/users{._format}_get_collection' !== $operation->getName()
            || !$user = $this->security->getUser()
        ) {
            return;
        }

        if (!$this->auth->isGranted('OIDC_ADMIN')) {
            $queryBuilder
                ->andWhere(\sprintf('%s = :user', $queryBuilder->getRootAliases()[0]))
                ->setParameter('user', $user);
        }
    }
}
