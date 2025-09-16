<?php

namespace App\Service\Export;

use App\Entity\Airport;
use App\Service\Export\ExportUtils;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class AirportExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private ExportUtils $exportUtils) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Airport::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Airport::class)
                    ->createQueryBuilder('a');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Code', 'Nom', 'Principal', 'Données météo', 'Documents'];

        $rows = array_map(fn(Airport $a) => [
            $a->getId() ?? '',
            $a->getCode() ?? '',
            $a->getName() ?? '',
            $a->isMain() ? 'Oui' : 'Non',
            $a->isMeteo() ? 'Oui' : 'Non',
            $this->exportUtils->getLinkList($a->getDocuments(), $format),
        ], $results);

        return [$headers, $rows];
    }
}
