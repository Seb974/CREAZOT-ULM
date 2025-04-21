<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Filter;

use Symfony\Component\PropertyInfo\Type;
use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\PropertyHelperTrait;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class RappelPeriodeFilter extends AbstractFilter
{
    use PropertyHelperTrait;

    public function getDescription(string $resourceClass): array
    {
        return [
            'periode' => [
                'property' => 'periode',
                'type' => Type::BUILTIN_TYPE_ARRAY,
                'required' => false,
                'swagger' => [
                    'description' => 'Filtre pour récupérer les rappels récurrents selon les jours (0-6) et les rappels ponctuels entre deux dates.',
                    'name' => 'periode',
                    'type' => 'array',
                ],
            ],
        ];
    }

    /**
     * @param string|null $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ($property !== 'periode') {
            return;
        }

        if (!is_array($value) || !isset($value['start'], $value['end'], $value['jours'])) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        $startParam = $queryNameGenerator->generateParameterName('start');
        $endParam = $queryNameGenerator->generateParameterName('end');
        $joursParam = $queryNameGenerator->generateParameterName('jours');

        $queryBuilder->andWhere(sprintf('
            (%1$s.recurrent = true AND %1$s.jour IN (:%2$s))
            OR
            (%1$s.recurrent = false AND %1$s.date >= :%3$s AND %1$s.date <= :%4$s)
        ', $alias, $joursParam, $startParam, $endParam));

        $queryBuilder->setParameter($joursParam, $value['jours']);
        $queryBuilder->setParameter($startParam, new \DateTime($value['start']));
        $queryBuilder->setParameter($endParam, new \DateTime($value['end']));
    }
}
