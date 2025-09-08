<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Filter;

use Doctrine\DBAL\Types\Types;
use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\PropertyHelperTrait;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class BeneficiaireOrLibelleFilter extends AbstractFilter
{
    use PropertyHelperTrait;

    public function getDescription(string $resourceClass): array
    {
        return [
            'intitule' => [
                'property' => 'intitule',
                'type' => 'string',
                'required' => false,
                'strategy' => 'iword_start',
                'is_collection' => true,
            ],
        ];
    }

    /**
     * @param string|null $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ('intitule' !== $property || !$value) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        $queryBuilder
            ->andWhere(
                $queryBuilder->expr()->orX(
                    $queryBuilder->expr()->like("LOWER($alias.beneficiaire)", ':intitule'),
                    $queryBuilder->expr()->like("LOWER($alias.libelle)", ':intitule')
                )
            )
            ->setParameter('intitule', '%' . strtolower($value) . '%');
    }
}
