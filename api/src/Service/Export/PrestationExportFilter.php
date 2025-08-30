<?php

namespace App\Service\Export;

use App\Entity\Circuit;
use App\Entity\Prestation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class PrestationExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Prestation::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Prestation::class)->createQueryBuilder('p')
                ->leftJoin('p.aeronef', 'aer')
                ->leftJoin('p.pilote', 'pil');

        // Aeronef
        $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
        if (!empty($aer)) {
            $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                ->setParameter('imm', "%$aer%");
        }

        // Pilote
        $pil = $params['pilote'] ?? ($params['pilote_firstName'] ?? null);
        if (!empty($pil)) {
            $qb->andWhere('LOWER(COALESCE(pil.firstName, \'\')) LIKE :pil')
                ->setParameter('pil', '%' . strtolower($pil) . '%');
        }

        // Date
        if (!empty($params['date']) && is_array($params['date'])) {
            if (!empty($params['date']['after'])) {
                $qb->andWhere('p.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
            }
            if (!empty($params['date']['before'])) {
                $qb->andWhere('p.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
            }
        }

        
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
        $headers = [ 'Id', 'Date', 'Pilote', 'Aeronef', 'Horametre départ', 'Duree', 'Horametre fin',
        'Vol Id', 'Circuit', 'Type de vol', 'Quantite', 'Duree Théorique du Vol', 'Vol Modifié le',
        'Vol Modifié par', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par' ];

        $rows = [];

        foreach ($results as $prestation) {
            $vols = $prestation->getVols();
            $first = true;

            foreach ($vols as $vol) {
                $prestationDate = $first ? $prestation->getDate()?->format('Y-m-d H:i') : '';
                $pilote = $first ? ($prestation->getPilote()?->getFirstName() ?? '') : '';
                $aeronef = $first ? $prestation->getAeronef()?->getImmatriculation() ?? '' : '';
                $duree = $first ? $this->getDecimalToTimeForPrestation($prestation) : '';
                $horametreDepart = $first ? $prestation->getHorametreDepart() ?? '' : '';
                $horametreFin = $first ? $prestation->getHorametreFin() ?? '' : '';
                $createdAt = $first ? $prestation->getCreatedAt()?->format('Y-m-d H:i') ?? ''  ?? '' : '';
                $createdBy = $first ? $prestation->getCreatedBy()?->getFirstName() ?? '' : '';
                $updatedAt = $first ? $prestation->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '';
                $updatedBy = $first ? $prestation->getUpdatedBy()?->getFirstName() ?? '' : '';

                $volDuree = $this->getVolDurationToHourMinute($vol->getDuree());

                $rows[] = [
                    $first ? $prestation->getId() : '',
                    $prestationDate,
                    $pilote,
                    $aeronef,
                    $horametreDepart,
                    $duree,
                    $horametreFin,
                    $vol->getId(),
                    $this->getCircuitName($vol->getCircuit()) ?? '',
                    $vol->getCircuit()?->getNature()?->getLabel() ?? '',
                    $vol->getQuantite(),
                    $volDuree,
                    $vol->getUpdatedAt()?->format('Y-m-d H:i') ?? '',
                    $vol->getUpdatedBy()?->getFirstName() ?? '',
                    $createdAt,
                    $createdBy,
                    $updatedAt,
                    $updatedBy
                ];

                $first = false;
            }
        }

        return [$headers, $rows];
    }

    private function getDecimalToTimeForPrestation(Prestation $prestation): ?string
    {
        $duree = $prestation->getDuree() ?? 0;
        $aeronef = $prestation->getAeronef();

        if (!$aeronef) return null;

        if ($aeronef->isDecimal()) {
            return $this->getDecimalToHourMinute($duree);
        }

        return $this->getVolDurationToHourMinute($duree);
    }

    private function getVolDurationToHourMinute(float $duration): string
    {
        $hours = floor($duration);
        $minutes = round(($duration - $hours) * 100);
        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getDecimalToHourMinute(float $decimalDuration): string
    {
        if (\is_null($decimalDuration)) return "00:00";

        $hours = floor($decimalDuration);
        $minutes = round(($decimalDuration - $hours) * 60);

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getCircuitName(Circuit $circuit): string 
    {
        $code = $circuit->getCode() ?? "";
        $name = $circuit->getNom() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }
}
