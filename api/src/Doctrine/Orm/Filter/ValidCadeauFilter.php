<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Filter;

use Doctrine\DBAL\Types\Types;
use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\PropertyHelperTrait;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class ValidCadeauFilter extends AbstractFilter
{
    use PropertyHelperTrait;

    public function getDescription(string $resourceClass): array
    {
        return [
            'valid' => [
                'property' => 'valid',
                'type' => 'string',
                'required' => false,
                'strategy' => 'iexact',
                'is_collection' => true,
            ],
        ];
    }

    /**
     * @param string|null $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ('valid' !== $property && 'valid.id' !== $property) {
            return;
        }

        $values = $this->normalizeValues($value, $property);
        if (null === $values || count($values) === 0) {
            return;
        }
        $alias = $queryBuilder->getRootAliases()[0];

        // Paramètres
        $validIdParam = $queryNameGenerator->generateParameterName("valid_id");
        $nowParam = $queryNameGenerator->generateParameterName("now");
        $usedParam = $queryNameGenerator->generateParameterName("used");

        $queryBuilder
            ->setParameter($nowParam, (new \DateTime())->format('Y-m-d 23:59:59'))
            ->setParameter($usedParam, false);

        if (('valid' === $property && ($values[0] === 'null' || is_null($values[0])) )) {
            $expression = $queryBuilder->expr()->andX(
                $queryBuilder->expr()->eq("{$alias}.used", ":{$usedParam}"),
                $queryBuilder->expr()->gte("{$alias}.fin", ":{$nowParam}")
            );
            $queryBuilder->andWhere($expression);
            return;
        }

        $queryBuilder
            ->setParameter($validIdParam, $values[0]);

        // Expression : (id = :valid_id) OR (used = false AND fin >= :now)
        $expression = $queryBuilder->expr()->orX(
            $queryBuilder->expr()->eq("{$alias}.id", ":{$validIdParam}"),
            $queryBuilder->expr()->andX(
                $queryBuilder->expr()->eq("{$alias}.used", ":{$usedParam}"),
                $queryBuilder->expr()->gte("{$alias}.fin", ":{$nowParam}")
            )
        );
        $queryBuilder->andWhere($expression);
    }

    /**
     * @param string|null $value
     */
    protected function normalizeValues($value, string $property): ?array
    {
        if (!\is_string($value) || empty(trim($value))) {
            return null;
        }

        $values = explode(' ', $value);
        foreach ($values as $key => $value) {
            if (empty(trim($value))) {
                unset($values[$key]);
            }
        }

        if (empty($values)) {
            $this->getLogger()->notice('Invalid filter ignored', [
                'exception' => new \InvalidArgumentException(\sprintf('At least one value is required, multiple values should be in "%1$s[]=firstvalue&%1$s[]=secondvalue" format', $property)),
            ]);

            return null;
        }

        return array_values($values);
    }
}
