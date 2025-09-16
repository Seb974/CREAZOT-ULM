<?php

namespace App\Service\Export;

use App\Entity\Cadeau;
use App\Entity\Circuit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class CadeauExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Cadeau::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Cadeau::class)->createQueryBuilder('c')
                        ->leftJoin('c.circuit', 'circuit')
                        ->leftJoin('c.options', 'opt')
                        ->leftJoin('c.origine', 'origine')
                        ->addSelect('circuit', 'opt', 'origine');

        foreach ($params as $key => $value) {
            if (empty($value) && $value !== '0') continue;

            switch ($key) {
                case 'beneficiaire':
                    $qb->andWhere('LOWER(c.beneficiaire) LIKE :beneficiaire')
                        ->setParameter('beneficiaire', '%' . strtolower($value) . '%');
                    break;
                case 'offreur':
                    $qb->andWhere('LOWER(c.offreur) LIKE :offreur')
                        ->setParameter('offreur', '%' . strtolower($value) . '%');
                    break;
                case 'circuit':
                case 'circuit_code':
                    $qb->andWhere('circuit.code LIKE :circuitCode')
                    ->setParameter('circuitCode', "%$value%");
                    break;

                case 'fin':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('c.fin >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('c.fin <= :before')->setParameter('before', $before);
                    }
                    break;
                case 'used':
                    $bool = filter_var($params['used'], FILTER_VALIDATE_BOOLEAN);
                    $qb->andWhere('c.used = :used')
                        ->setParameter('used', $bool);
            }
        }

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Code', 'Reference du paiement', 'Date', 'Fin de validité',
            'Beneficiaire', 'Offreur', 'Telephone', 'Email', 'Quantite', 'Circuit',
            'Options', 'Prix', 'Message', 'Origine', 'Utilisé'];

        $rows = array_map(fn(Cadeau $r) => [
            $r->getId(),
            $r->getCode(),
            $r->getPaymentId(),
            $r->getDate()?->format('Y-m-d H:i:s') ?? '',
            $r->getFin()?->format('Y-m-d H:i:s') ?? '',
            $r->getBeneficiaire(),
            $r->getOffreur(),
            $r->getTelephone(),
            $r->getEmail(),
            $r->getQuantite(),
            $this->getCircuitName($r->getCircuit()),
            $r->getOptions()?->getNom(),
            $r->getPrix(),
            $r->getMessage(),
            implode(', ', $r->getOrigine()->map(fn($o) => $o->getName())->toArray()),
            $r->isUsed() ? 'Oui' : 'Non'
        ], $results);
        
        return [$headers, $rows];
    }

    private function getCircuitName(Circuit $circuit): string 
    {
        $code = $circuit->getCode() ?? "";
        $name = $circuit->getNom() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }
}
