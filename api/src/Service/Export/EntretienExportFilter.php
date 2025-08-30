<?php

namespace App\Service\Export;

use App\Entity\Entretien;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class EntretienExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Entretien::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Entretien::class)->createQueryBuilder('e')
                        ->leftJoin('e.aeronef', 'aer');

        $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
        if (!empty($aer)) {
            $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                ->setParameter('imm', "%$aer%");
        }

        if (isset($params['changementMoteur'])) {
            $bool = filter_var($params['changementMoteur'], FILTER_VALIDATE_BOOLEAN);
            $qb->andWhere('e.changementMoteur = :cm')->setParameter('cm', $bool);
        }

        if (!empty($params['date']) && is_array($params['date'])) {
            if (!empty($params['date']['after'])) {
                $qb->andWhere('e.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
            }
            if (!empty($params['date']['before'])) {
                $qb->andWhere('e.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
            }
        }
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
       $headers = ['Id', 'Date', 'Aéronef', 'Horamètre intervention', 'Intervention', 'Changement Moteur', 'Intervenants', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Entretien $e) => [
            $e->getId(),
            $e->getDate()?->format('Y-m-d') ?? '',
            $e->getAeronef()?->getImmatriculation() ?? '',
            $e->getHorametreIntervention() ?? '',
            $e->getIntervention() ?? '',
            $e->isChangementMoteur() ? 'Oui' : 'Non',
            implode(', ', array_map(fn($u) => $u->getFirstName(), $e->getIntervenants()->toArray())),
            $e->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getCreatedBy()?->getFirstName() ?? '',
            $e->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getUpdatedBy()?->getFirstName() ?? ''
        ], $results);

        return [$headers, $rows];
    }
}
