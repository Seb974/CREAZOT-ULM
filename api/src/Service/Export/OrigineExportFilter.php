<?php

namespace App\Service\Export;

use App\Entity\Origine;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class OrigineExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Origine::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Origine::class)
                    ->createQueryBuilder('o');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Nom', 'Remise', 'Rétro-commission'];

        $rows = array_map(fn(Origine $c) => [
            $c->getId() ?? '',
            $c->getName() ?? '',
            ($c->getDiscount() ?? '0') . '%',
            $c->getHasCommission() ? 'Oui' : 'Non'
        ], $results);

        return [$headers, $rows];
    }
}
