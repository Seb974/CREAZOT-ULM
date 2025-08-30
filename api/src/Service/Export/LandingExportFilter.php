<?php

namespace App\Service\Export;

use App\Entity\Landing;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class LandingExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Landing::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Landing::class)->createQueryBuilder('l')
                ->join('l.vol', 'v')
                ->join('v.prestation', 'p')
                ->leftJoin('p.aeronef', 'aer')
                ->leftJoin('p.pilote', 'pil');

        if (!empty($params['airport'])) {
            $qb->andWhere(
                $qb->expr()->orX(
                    'l.airportCode LIKE :airport',
                    'l.airportName LIKE :airport'
                )
            )->setParameter('airport', "%{$params['airport']}%");
        }

        // Aeronef
        $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
        if (!empty($aer)) {
            $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                ->setParameter('imm', "%$aer%");
        }

        // Pilote
        $pil = $params['pilote'] ?? ($params['pilote_firstName'] ?? null);
        if (!empty($pil)) {
            $qb->andWhere('COALESCE(pil.firstName, \'\') LIKE :pil')
                ->setParameter('pil', "%$pil%");
        }

        // Date
        if (!empty($params['date']) && is_array($params['date'])) {
            if (!empty($params['date']['after'])) {
                $qb->andWhere('p.date >= :after')
                ->setParameter('after', new \DateTimeImmutable($params['date']['after']));
            }
            if (!empty($params['date']['before'])) {
                $qb->andWhere('p.date <= :before')
                ->setParameter('before', new \DateTimeImmutable($params['date']['before']));
            }
        }
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
        $headers = ['Id', 'Date', 'Aeronef', 'Lieu', 'Nb touches', 'Nb complets'];

        $rows = array_map(fn(Landing $a) => [
            $a->getId(),
            $a->getVol()?->getPrestation()?->getDate()?->format('Y-m-d') ?? '',
            $a->getVol()?->getPrestation()?->getAeronef()?->getImmatriculation(),
            $this->getAirportName($a),
            $a->getTouches() ?? 0,
            $a->getComplets() ?? 0
        ], $results);

        return [$headers, $rows];
    }

    private function getAirportName(Landing $landing): string 
    {
        $code = $landing->getAirportCode() ?? "";
        $name = $landing->getAirportName() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }
}
