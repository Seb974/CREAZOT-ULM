<?php

namespace App\Service\Export;

use App\Entity\Expense;
use App\Service\Export\ExportUtils;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class ExpenseExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private ExportUtils $exportUtils) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Expense::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Expense::class)
                        ->createQueryBuilder('p')
                        ->leftJoin('p.details', 'details');

        foreach ($params as $key => $value) {
            if (empty($value) && $value !== '0') continue;

            switch ($key) {
                case 'intitule':
                    $qb->andWhere('LOWER(p.name) LIKE :intitule')
                        ->setParameter('intitule', '%' . strtolower($value) . '%');
                    break;
                case 'mode':
                case 'details_mode':
                    $qb->andWhere('LOWER(details.mode) LIKE :mode')
                        ->setParameter('mode', '%' . strtolower($value) . '%');
                    break;
                case 'date':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('p.date >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('p.date <= :before')->setParameter('before', $before);
                    }
                    break;
            }
        }

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Date', 'Beneficiaire', 'Libelle', 'Total HT', 'TVA', 'Total TTC', 'Mode', 'Montant', 'Justificatif'];

        $rows = [];

        foreach ($results as $expense) {
            $details = $expense->getDetails();
            $first = true;

            foreach ($details as $detail) {
                $rows[] = [
                    $first ? $expense->getId() : '',
                    $first ? $expense->getDate()?->format('Y-m-d H:i') : '',
                    $first ? ($expense->getBeneficiaire() ?? '') : '',
                    $first ? ($expense->getLibelle() ?? '') : '',
                    $first ? ($expense->getTotalHT() ?? 0) . ' €' : '',
                    $first ? ($expense->getTva() ?? 0) * 100 . ' %' : '',
                    $first ? ($expense->getTotalTTC() ?? 0) . ' €' : '',
                    $this->getExpenseDetailName($detail->getMode()) ?? '',
                    $detail->getAmount() . ' €',
                    $first ? $this->exportUtils->makeLink($expense->getDocument(), null, $format) ?? '' : '',
                ];

                $first = false;
            }
        }

        return [$headers, $rows];
    }

     private function getExpenseDetailName(string $code): string 
    {
        $expenses = [
            'cb'       => 'CB',
            'especes'  => 'Espèces',
            'web'      => 'Site Web',
            'virement' => 'Virement',
            'cheque'   => 'Chèque'
        ];

        return $expenses[$code] ?? '';
    }
}
