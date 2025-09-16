<?php

namespace App\Service\Export;

use App\Entity\Vol;
use App\Entity\Landing;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class VolExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Vol::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Vol::class)
            ->createQueryBuilder('v')
            ->leftJoin('v.circuit', 'circuit')
            ->leftJoin('v.prestation', 'prestation')
            ->leftJoin('prestation.pilote', 'pilote')
            ->leftJoin('prestation.aeronef', 'aeronef')
            ->addSelect('circuit', 'prestation', 'pilote', 'aeronef');

        foreach ($params as $key => $value) {
            if (empty($value) && $value !== '0') continue;

            switch ($key) {
                case 'aeronef':
                case 'prestation_aeronef':
                case 'aeronef_immatriculation':
                case 'prestation_aeronef_immatriculation':
                    $qb->andWhere('LOWER(aeronef.immatriculation) LIKE :immatriculation')
                        ->setParameter('immatriculation', '%' . strtolower($value) . '%');
                    break;
                case 'pilote':
                case 'prestation_pilote':
                case 'pilote_firstName':
                case 'prestation_pilote_firstName':
                    $qb->andWhere('LOWER(pilote.firstName) LIKE :name')
                        ->setParameter('name', '%' . strtolower($value) . '%');
                    break;
                case 'circuit':
                case 'circuit_code':
                    $qb->andWhere('LOWER(circuit.code) LIKE :circuitCode')
                        ->setParameter('circuitCode', '%' . strtolower($value) . '%');
                    break;

                case 'date':
                case 'prestation_date':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('prestation.date >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('prestation.date <= :before')->setParameter('before', $before);
                    }
                    break;
            }
        }

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = [
            'Id', 'Date', 'Pilote', 'Aeronef', 'Quantite', 'Circuit',
            'Type de vol', 'Duree Théorique', 'Aéroport',
            'Nb Touchés', 'Nb Complets',
            'Créé le', 'Créé par', 'Modifié le', 'Modifié par'
        ];

        $rows = [];

        foreach ($results as $vol) {
            $first = true;
            $prestation = $vol->getPrestation();
            $landings = $vol->getLandings();

            foreach ($landings as $landing) {
                $rows[] = [
                    $first ? $vol->getId() ?? '' : '',
                    $first ? $prestation->getDate()?->format('Y-m-d') : '',
                    $first ? $prestation->getPilote()?->getFirstName() ?? '' : '',
                    $first ? $prestation->getAeronef()?->getImmatriculation() ?? '' : '',
                    $first ? $vol->getQuantite() ?? '' : '',
                    $first ? ($vol->getCircuit()?->getNom() ?? '') : '',
                    $first ? ($vol->getCircuit()?->getNature()?->getLabel() ?? '') : '',
                    $first ? $this->getVolDurationToHourMinute($vol->getDuree()) : '',
                    $this->getAirportName($landing),
                    $landing->getTouches() ?? 0,
                    $landing->getComplets() ?? 0,
                    $first ? $vol->getCreatedAt()?->format('Y-m-d H:i') ?? '' : '',
                    $first ? $vol->getCreatedBy()?->getFirstName() ?? '' : '',
                    $first ? $vol->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '',
                    $first ? $vol->getUpdatedBy()?->getFirstName() ?? '' : ''
                ];
                $first = false;
            }
        }

        return [$headers, $rows];
    }

    private function getVolDurationToHourMinute(float $duration): string
    {
        if (!$duration) return "00:00";

        $hours = floor($duration);
        $minutes = round(($duration - $hours) * 100);
        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getAirportName(Landing $landing): string 
    {
        $code = $landing->getAirportCode() ?? "";
        $name = $landing->getAirportName() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }
}
