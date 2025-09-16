<?php

namespace App\Service\Export;

use App\Entity\Aeronef;
use App\Service\Export\ExportUtils;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class AeronefExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private ExportUtils $exportUtils) {}

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

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Immatriculation', 'Horamètre', 'Affichage décimal', 'Prochaine maintenance', 'Prochain changement moteur', 
                    'Code Balise', 'Disponible', 'Documents', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Aeronef $a) => [
            $a->getId(),
            $a->getImmatriculation(),
            $a->getHorametre(),
            $a->isDecimal() ? 'Oui' : 'Non',   
            $a->getEntretien(),
            $a->getChangementMoteur(),
            $a->getCodeBalise(),
            $a->getIsAvailable() ? 'Oui' : 'Non',
            $this->exportUtils->getLinkList($a->getDocuments(), $format),
            $a->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getCreatedBy()?->getFirstName(),
            $a->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getUpdatedBy()?->getFirstName()
        ], $results);

        return [$headers, $rows];
    }
}
