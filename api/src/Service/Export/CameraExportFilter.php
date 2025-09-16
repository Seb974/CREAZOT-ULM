<?php

namespace App\Service\Export;

use App\Entity\Camera;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class CameraExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Camera::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Camera::class)
                    ->createQueryBuilder('c');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Code', 'Nom'];

        $rows = array_map(fn(Camera $c) => [
            $c->getId() ?? '',
            $c->getCode() ?? '',
            $c->getNom() ?? ''
        ], $results);

        return [$headers, $rows];
    }
}
