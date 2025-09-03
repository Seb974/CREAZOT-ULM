<?php

namespace App\Doctrine\Orm\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;

final class AvailablePiloteFilter extends AbstractFilter
{
    public function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void {
        if ($property !== 'debut') return;

        $alias = $queryBuilder->getRootAliases()[0];

        $debut = $context['filters']['debut'] ?? null;
        $fin = $context['filters']['fin'] ?? null;
        $timezone = $context['filters']['timezone'] ?? 'UTC';
        $reservationId = $context['filters']['reservationId'] ?? null;
        $certificatMedicalRequired = $context['filters']['exists[certificatMedical]'] ?? false;

        if (!$debut || !$fin) return;

        try {
            $tz = new \DateTimeZone($timezone);
            $debutUtc = (new \DateTimeImmutable($debut, $tz))->setTimezone(new \DateTimeZone('UTC'));
            $finUtc = (new \DateTimeImmutable($fin, $tz))->setTimezone(new \DateTimeZone('UTC'));
        } catch (\Exception $e) {
            return;
        }

        // 1. Filtre réservation : exclure pilotes déjà pris
        $resAlias = $queryNameGenerator->generateJoinAlias('r');
        $reservationCondition = sprintf(
            'NOT EXISTS (
                SELECT 1 FROM App\Entity\Reservation %s
                WHERE IDENTITY(%s.pilote) = IDENTITY(%s.pilote)
                AND %s.debut < :fin
                AND %s.fin > :debut
            )',
            $resAlias,
            $resAlias,
            $alias,
            $resAlias,
            $resAlias
        );

        if ($reservationId) {
            $editAlias = $queryNameGenerator->generateJoinAlias('r');
            $reservationCondition = sprintf(
                '(
                    EXISTS (
                        SELECT 1 FROM App\Entity\Reservation %s
                        WHERE %s.id = :reservationId
                        AND IDENTITY(%s.pilote) = IDENTITY(%s.pilote)
                    )
                    OR %s
                )',
                $editAlias,
                $editAlias,
                $editAlias,
                $alias,
                $reservationCondition
            );

            $queryBuilder->setParameter('reservationId', $reservationId);
        }

        // 2. Filtre disponibilité : selon availableByDefault
        $indispoAlias = $queryNameGenerator->generateJoinAlias('d_indispo');
        $dispoAlias   = $queryNameGenerator->generateJoinAlias('d_dispo');

        // a) par défaut dispo → exclure si une indispo chevauche
        $indispoCondition = sprintf(
            'NOT EXISTS (
                SELECT 1 FROM App\Entity\Disponibilite %s
                WHERE IDENTITY(%s.pilote) = %s.id
                AND %s.debut <= :fin
                AND %s.fin >= :debut
            )',
            $indispoAlias,
            $indispoAlias,
            $alias,
            $indispoAlias,
            $indispoAlias
        );

        // b) par défaut indispo → inclure seulement si une dispo recouvre entièrement
        $dispoCondition = sprintf(
            'EXISTS (
                SELECT 1 FROM App\Entity\Disponibilite %s
                WHERE IDENTITY(%s.pilote) = %s.id
                AND %s.debut <= :debut
                AND %s.fin >= :fin
            )',
            $dispoAlias,
            $dispoAlias,
            $alias,
            $dispoAlias,
            $dispoAlias
        );

        $availabilityCondition = sprintf(
            '(
                (%1$s.availableByDefault = true AND %2$s)
                OR
                (%1$s.availableByDefault = false AND %3$s)
            )',
            $alias,
            $indispoCondition,
            $dispoCondition
        );

        // 3. Application des conditions
        $queryBuilder
            ->andWhere($reservationCondition)
            ->andWhere($availabilityCondition)
            ->setParameter('debut', $debutUtc)
            ->setParameter('fin', $finUtc);

        if ($certificatMedicalRequired)
            $queryBuilder->andWhere(sprintf('%s.certificatMedical IS NOT NULL', $alias));
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
                'description' => 'ID de la réservation (mode édition) — le pilote lié restera visible',
            ],
            'exists[certificatMedical]' => [
                'property' => 'exists[certificatMedical]',
                'type' => 'boolean',
                'required' => false,
                'description' => 'Filtre pour ne récupérer que les pilotes ayant un certificat médical valide',
            ]
        ];
    }
}
