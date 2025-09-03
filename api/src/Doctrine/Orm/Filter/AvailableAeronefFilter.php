<?php

namespace App\Doctrine\Orm\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;

final class AvailableAeronefFilter extends AbstractFilter
{
    public function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        // Logique exécutée une seule fois (sur "debut")
        if ($property !== 'debut') {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        // Récupérer les filtres
        $debut = $context['filters']['debut'] ?? null;
        $fin = $context['filters']['fin'] ?? null;
        $timezone = $context['filters']['timezone'] ?? 'UTC';
        $reservationId = $context['filters']['reservationId'] ?? null;

        if (!$debut || !$fin) {
            return;
        }

        try {
            $tz = new \DateTimeZone($timezone);
            $debutUtc = (new \DateTimeImmutable($debut, $tz))->setTimezone(new \DateTimeZone('UTC'));
            $finUtc = (new \DateTimeImmutable($fin, $tz))->setTimezone(new \DateTimeZone('UTC'));
        } catch (\Exception $e) {
            return;
        }

        // On garde uniquement les aéronefs disponibles
        $queryBuilder->andWhere(sprintf('%s.isAvailable = true', $alias));

        // Alias pour le LEFT JOIN
        $resAlias = $queryNameGenerator->generateJoinAlias('r');

        // LEFT JOIN pour exclure les aéronefs réservés sur la période
        $queryBuilder
            ->leftJoin(
                'App\Entity\Reservation',
                $resAlias,
                'WITH',
                sprintf('%s.avion = %s AND %s.debut < :fin AND %s.fin > :debut', $resAlias, $alias, $resAlias, $resAlias)
            )
            ->andWhere(sprintf('%s.id IS NULL', $resAlias))
            ->setParameter('debut', $debutUtc)
            ->setParameter('fin', $finUtc);

        // Mode édition : on garde l’aéronef déjà choisi
        if ($reservationId) {
            $editAlias = $queryNameGenerator->generateJoinAlias('r'); // alias unique
            $queryBuilder->orWhere(sprintf(
                'EXISTS (SELECT 1 FROM App\Entity\Reservation %s WHERE %s.id = :reservationId AND %s.avion = %s)',
                $editAlias,
                $editAlias,
                $editAlias,
                $alias
            ));
            $queryBuilder->setParameter('reservationId', $reservationId);
        }
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'debut' => [
                'property' => 'debut',
                'type' => 'string',
                'required' => true,
                'description' => 'Date de début (ISO 8601, locale)',
            ],
            'fin' => [
                'property' => 'fin',
                'type' => 'string',
                'required' => true,
                'description' => 'Date de fin (ISO 8601, locale)',
            ],
            'timezone' => [
                'property' => 'timezone',
                'type' => 'string',
                'required' => false,
                'description' => 'Timezone de l’utilisateur (ex: Indian/Reunion). Par défaut UTC',
            ],
            'reservationId' => [
                'property' => 'reservationId',
                'type' => 'integer',
                'required' => false,
                'description' => 'ID de la réservation à inclure (mode édition)',
            ],
        ];
    }
}
