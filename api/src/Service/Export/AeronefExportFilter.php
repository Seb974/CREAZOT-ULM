<?php

namespace App\Service\Export;

use App\Entity\Aeronef;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class AeronefExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Aeronef::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Aeronef::class)
                    ->createQueryBuilder('a');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
        $headers = ['Id', 'Immatriculation', 'Horamètre', 'Code Balise', 'Affichage décimal', 
                    'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Aeronef $a) => [
            $a->getId(),
            $a->getImmatriculation(),
            $a->getHorametre(),
            $a->getCodeBalise(),
            $a->isDecimal() ? 'Oui' : 'Non',
            $a->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getCreatedBy()?->getFirstName(),
            $a->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getUpdatedBy()?->getFirstName()
        ], $results);

        return [$headers, $rows];
    }
}
