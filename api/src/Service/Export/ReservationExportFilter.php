<?php

namespace App\Service\Export;

use App\Entity\Circuit;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class ReservationExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Reservation::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Reservation::class)
                        ->createQueryBuilder('r')
                        ->leftJoin('r.circuit', 'circuit')
                        ->leftJoin('r.option', 'opt')
                        ->leftJoin('r.pilote', 'pil')
                        ->leftJoin('r.avion', 'aer')
                        ->leftJoin('r.cadeau', 'cadeau')
                        ->leftJoin('r.origine', 'origine')
                        ->leftJoin('r.contact', 'contact')
                        ->addSelect('circuit', 'opt', 'pil', 'aer', 'cadeau', 'origine', 'contact');

        foreach ($params as $key => $value) {
            if (empty($value) && $value !== '0') continue;

            switch ($key) {
                case 'nom':
                    $qb->andWhere('LOWER(r.nom) LIKE :nom')
                        ->setParameter('nom', '%' . strtolower($value) . '%');
                    break;

                case 'circuit':
                case 'circuit_code':
                    $qb->andWhere('LOWER(circuit.code) LIKE :circuitCode')
                        ->setParameter('circuitCode', '%' . strtolower($value) . '%');
                    break;

                case 'debut':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('r.debut >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('r.debut <= :before')->setParameter('before', $before);
                    }
                    break;
            }
        }
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
       $headers = ['Id', 'Code', 'Reference du paiement', 'Debut', 'Fin', 'Nom', 'Telephone',
            'Email', 'Quantite', 'Circuit', 'Option', 'Statut', 'Prix', 'Pilote', 'Aeronef', 
            'Report', 'Paye', 'Upsell', 'Origine', 'Contact', 'Code cadeau', 
            'Beneficiaire cadeau', 'Offreur cadeau', 'N° de paiement du cadeau'];

        $rows = array_map(fn(Reservation $r) => [
            $r->getId(),
            $r->getCode(),
            $r->getPaymentReference(),
            $r->getDebut()?->format('Y-m-d H:i:s') ?? '',
            $r->getFin()?->format('Y-m-d H:i:s') ?? '',
            $r->getNom(),
            $r->getTelephone(),
            $r->getEmail(),
            $r->getQuantite(),
            $this->getCircuitName($r->getCircuit()),
            $r->getOption()?->getNom(),
            $this->getFormattedStatut($r->getStatut()),
            $r->getPrix(),
            $r->getPilote()?->getFirstName(),
            $r->getAvion()?->getImmatriculation(),
            $r->isReport() ? 'Oui' : 'Non',
            $r->isPaid() ? 'Oui' : 'Non',
            $r->isUpsell() ? 'Oui' : 'Non',
            implode(', ', $r->getOrigine()->map(fn($o) => $o->getName())->toArray()),
            implode(', ', $r->getContact()->map(fn($c) => $c->getName())->toArray()),
            $r->getCadeau()?->getCode(),
            $r->getCadeau()?->getBeneficiaire(),
            $r->getCadeau()?->getOffreur(),
            $r->getCadeau()?->getPaymentId(), 
        ], $results);

        return [$headers, $rows];
    }

    private function getCircuitName(Circuit $circuit): string 
    {
        $code = $circuit->getCode() ?? "";
        $name = $circuit->getNom() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }

    private function getFormattedStatut($code): string 
    {
        $statuts = [
            "VALIDATED"         => "Validé",
            "WAITING"           => "En attente de confirmation",
            "WHEATER_REPORT"    => "Report météo",
            "PASSENGER_REPORT"  => "Report client",
            "INTERN_REPORT"     => "Report interne",
            "WHEATER_CANCEL"    => "Annulation météo",
            "PASSENGER_CANCEL"  => "Annulation client",
            "INTERN_CANCEL"     => "Annulation interne"
        ];

        return $statuts[$code] ?? '';
    }
}
