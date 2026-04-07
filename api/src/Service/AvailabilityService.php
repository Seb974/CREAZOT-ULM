<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Aeronef;
use App\Entity\Circuit;
use App\Entity\Client;
use App\Entity\ProfilPilote;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class AvailabilityService
{
    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {}

    /**
     * @return list<array{debut: \DateTime, fin: \DateTime, aeronef: Aeronef, pilote: ProfilPilote, circuit: Circuit, prix: float}>
     */
    public function findAvailableSlots(Client $client, Circuit $circuit, \DateTimeInterface $date, int $maxSlots = 5): array
    {
        $durationMinutes = $this->getCircuitDurationMinutes($circuit);
        if ($durationMinutes <= 0) {
            $this->logger->warning('Circuit {code} has no valid duration', ['code' => $circuit->getCode()]);
            return [];
        }

        $clientId = $client->getId();
        $tz = new \DateTimeZone($client->getTimezone() ?? 'Indian/Reunion');

        $dayStart = $this->buildDayBoundary($date, $client->getMinHours(), $tz, 6, 0);
        $dayEnd = $this->buildDayBoundary($date, $client->getMaxHours(), $tz, 20, 0);

        $aircraft = $this->getAvailableAircraft($clientId);
        if (empty($aircraft)) {
            $this->logger->info('No available aircraft for client {id}', ['id' => $clientId]);
            return [];
        }

        $pilots = $this->getQualifiedPilots($clientId, $circuit);
        if (empty($pilots)) {
            $this->logger->info('No qualified pilot for circuit {code} / client {id}', [
                'code' => $circuit->getCode(), 'id' => $clientId,
            ]);
            return [];
        }

        $existingReservations = $this->getReservationsForDay($clientId, $dayStart, $dayEnd);
        $unavailabilities = $this->getUnavailabilitiesForDay($pilots, $dayStart, $dayEnd);

        $slots = [];
        $cursor = clone $dayStart;
        $interval = new \DateInterval("PT{$durationMinutes}M");

        while ($cursor < $dayEnd && count($slots) < $maxSlots) {
            $slotEnd = (clone $cursor)->add($interval);
            if ($slotEnd > $dayEnd) {
                break;
            }

            $foundAeronef = $this->findFreeAircraft($aircraft, $existingReservations, $cursor, $slotEnd);
            if (!$foundAeronef) {
                $cursor = (clone $cursor)->modify('+30 minutes');
                continue;
            }

            $foundPilot = $this->findFreePilot($pilots, $existingReservations, $unavailabilities, $cursor, $slotEnd);
            if (!$foundPilot) {
                $cursor = (clone $cursor)->modify('+30 minutes');
                continue;
            }

            $slots[] = [
                'debut' => clone $cursor,
                'fin' => clone $slotEnd,
                'aeronef' => $foundAeronef,
                'pilote' => $foundPilot,
                'circuit' => $circuit,
                'prix' => $circuit->getPrix() ?? 0.0,
            ];

            $cursor = clone $slotEnd;
        }

        return $slots;
    }

    /**
     * @return array{aeronef: Aeronef, pilote: ProfilPilote}|false
     */
    public function isSlotAvailable(
        Client $client,
        Circuit $circuit,
        \DateTimeInterface $debut,
        \DateTimeInterface $fin,
        ?Aeronef $preferredAeronef = null,
        ?ProfilPilote $preferredPilote = null,
    ): array|false {
        $clientId = $client->getId();

        $tz = new \DateTimeZone($client->getTimezone() ?? 'Indian/Reunion');
        $dayStart = $this->buildDayBoundary($debut, $client->getMinHours(), $tz, 6, 0);
        $dayEnd = $this->buildDayBoundary($debut, $client->getMaxHours(), $tz, 20, 0);

        if ($debut < $dayStart || $fin > $dayEnd) {
            return false;
        }

        $aircraft = $this->getAvailableAircraft($clientId);
        $pilots = $this->getQualifiedPilots($clientId, $circuit);
        $reservations = $this->getReservationsForDay($clientId, $dayStart, $dayEnd);
        $unavailabilities = $this->getUnavailabilitiesForDay($pilots, $dayStart, $dayEnd);

        $aeronef = null;
        if ($preferredAeronef && $this->isAircraftFree($preferredAeronef, $reservations, $debut, $fin)) {
            $aeronef = $preferredAeronef;
        } else {
            $aeronef = $this->findFreeAircraft($aircraft, $reservations, $debut, $fin);
        }
        if (!$aeronef) {
            return false;
        }

        $pilote = null;
        if ($preferredPilote && $this->isPilotFree($preferredPilote, $reservations, $unavailabilities, $debut, $fin)) {
            $pilote = $preferredPilote;
        } else {
            $pilote = $this->findFreePilot($pilots, $reservations, $unavailabilities, $debut, $fin);
        }
        if (!$pilote) {
            return false;
        }

        return ['aeronef' => $aeronef, 'pilote' => $pilote];
    }

    /**
     * @return Circuit[]
     */
    public function getAvailableCircuits(Client $client): array
    {
        return $this->em->createQueryBuilder()
            ->select('c')
            ->from(Circuit::class, 'c')
            ->andWhere('c.client = :clientId')
            ->setParameter('clientId', $client->getId())
            ->orderBy('c.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    // ──────────────── Private helpers ────────────────

    private function getCircuitDurationMinutes(Circuit $circuit): int
    {
        $duree = $circuit->getDuree();
        if (!$duree) {
            return 0;
        }

        return (int) $duree->format('H') * 60 + (int) $duree->format('i');
    }

    private function buildDayBoundary(
        \DateTimeInterface $date,
        ?\DateTimeInterface $hourRef,
        \DateTimeZone $tz,
        int $defaultHour,
        int $defaultMinute,
    ): \DateTime {
        $h = $hourRef ? (int) $hourRef->format('H') : $defaultHour;
        $m = $hourRef ? (int) $hourRef->format('i') : $defaultMinute;

        $dt = new \DateTime($date->format('Y-m-d'), $tz);
        $dt->setTime($h, $m, 0);

        return $dt;
    }

    /**
     * @return Aeronef[]
     */
    private function getAvailableAircraft(int $clientId): array
    {
        return $this->em->createQueryBuilder()
            ->select('a')
            ->from(Aeronef::class, 'a')
            ->andWhere('a.client = :clientId')
            ->andWhere('a.isAvailable = true')
            ->setParameter('clientId', $clientId)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return ProfilPilote[]
     */
    private function getQualifiedPilots(int $clientId, Circuit $circuit): array
    {
        $qb = $this->em->createQueryBuilder()
            ->select('pp')
            ->from(ProfilPilote::class, 'pp')
            ->join('pp.pilote', 'u')
            ->join('u.clients', 'cl')
            ->andWhere('cl.id = :clientId')
            ->setParameter('clientId', $clientId);

        $requiredQualifications = $circuit->getQualifications();
        if ($requiredQualifications->count() > 0) {
            $qb->join('pp.qualifications', 'q')
               ->andWhere('q.id IN (:qualIds)')
               ->setParameter('qualIds', $requiredQualifications->map(fn($q) => $q->getId())->toArray());
        }

        if ($circuit->isNeedsEncadrant()) {
            if ($requiredQualifications->count() === 0) {
                $qb->join('pp.qualifications', 'q');
            }
            $qb->andWhere('q.encadrant = true');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<int, array{aeronef_id: int, pilote_id: int|null, debut: \DateTimeInterface, fin: \DateTimeInterface}>
     */
    private function getReservationsForDay(int $clientId, \DateTimeInterface $dayStart, \DateTimeInterface $dayEnd): array
    {
        return $this->em->createQueryBuilder()
            ->select('r.id, IDENTITY(r.avion) as aeronef_id, IDENTITY(r.pilote) as pilote_id, r.debut, r.fin')
            ->from(\App\Entity\Reservation::class, 'r')
            ->andWhere('r.client = :clientId')
            ->andWhere('r.debut < :dayEnd')
            ->andWhere('r.fin > :dayStart')
            ->setParameter('clientId', $clientId)
            ->setParameter('dayStart', $dayStart)
            ->setParameter('dayEnd', $dayEnd)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @return array<int, array{pilote_id: int, debut: \DateTimeInterface, fin: \DateTimeInterface}>
     */
    private function getUnavailabilitiesForDay(array $pilots, \DateTimeInterface $dayStart, \DateTimeInterface $dayEnd): array
    {
        if (empty($pilots)) {
            return [];
        }

        $pilotIds = array_map(fn(ProfilPilote $p) => $p->getId(), $pilots);

        return $this->em->createQueryBuilder()
            ->select('IDENTITY(d.pilote) as pilote_id, d.debut, d.fin')
            ->from(\App\Entity\Disponibilite::class, 'd')
            ->andWhere('d.pilote IN (:pilotIds)')
            ->andWhere('d.debut < :dayEnd')
            ->andWhere('d.fin > :dayStart')
            ->setParameter('pilotIds', $pilotIds)
            ->setParameter('dayStart', $dayStart)
            ->setParameter('dayEnd', $dayEnd)
            ->getQuery()
            ->getArrayResult();
    }

    private function findFreeAircraft(array $aircraft, array $reservations, \DateTimeInterface $debut, \DateTimeInterface $fin): ?Aeronef
    {
        foreach ($aircraft as $a) {
            if ($this->isAircraftFree($a, $reservations, $debut, $fin)) {
                return $a;
            }
        }
        return null;
    }

    private function isAircraftFree(Aeronef $aeronef, array $reservations, \DateTimeInterface $debut, \DateTimeInterface $fin): bool
    {
        foreach ($reservations as $r) {
            if ((int) $r['aeronef_id'] === $aeronef->getId() && $this->overlaps($r['debut'], $r['fin'], $debut, $fin)) {
                return false;
            }
        }
        return true;
    }

    private function findFreePilot(array $pilots, array $reservations, array $unavailabilities, \DateTimeInterface $debut, \DateTimeInterface $fin): ?ProfilPilote
    {
        foreach ($pilots as $p) {
            if ($this->isPilotFree($p, $reservations, $unavailabilities, $debut, $fin)) {
                return $p;
            }
        }
        return null;
    }

    private function isPilotFree(ProfilPilote $pilote, array $reservations, array $unavailabilities, \DateTimeInterface $debut, \DateTimeInterface $fin): bool
    {
        $userId = $pilote->getPilote()?->getId();
        if (!$userId) {
            return false;
        }

        foreach ($reservations as $r) {
            if ($r['pilote_id'] && (string) $r['pilote_id'] === (string) $userId && $this->overlaps($r['debut'], $r['fin'], $debut, $fin)) {
                return false;
            }
        }

        $piloteId = $pilote->getId();
        foreach ($unavailabilities as $u) {
            if ((int) $u['pilote_id'] === $piloteId && $this->overlaps($u['debut'], $u['fin'], $debut, $fin)) {
                return false;
            }
        }

        return true;
    }

    private function overlaps(\DateTimeInterface $aStart, \DateTimeInterface $aEnd, \DateTimeInterface $bStart, \DateTimeInterface $bEnd): bool
    {
        return $aStart < $bEnd && $aEnd > $bStart;
    }
}
