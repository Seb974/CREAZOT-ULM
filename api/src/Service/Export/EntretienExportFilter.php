<?php

namespace App\Service\Export;

use App\Entity\Entretien;
use App\Service\Export\ExportUtils;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\HttpFoundation\Request;

class EntretienExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private ExportUtils $exportUtils) {}

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
            $qb->andWhere('LOWER(COALESCE(aer.immatriculation, \'\')) LIKE :imm')
                ->setParameter('imm', '%' . strtolower($aer) . '%');
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
        return $qb->orderBy('e.date', 'DESC')->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
       $headers = ['Id', 'Date', 'Aéronef', 'Horamètre intervention', 'Intervention', 'Changement Moteur', 'Intervenants', 'Factures', 'Autres documents', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Entretien $e) => [
            $e->getId(),
            $e->getDate()?->format('Y-m-d') ?? '',
            $e->getAeronef()?->getImmatriculation() ?? '',
            $e->getHorametreIntervention() ?? '',
            $e->getIntervention() ?? '',
            $e->isChangementMoteur() ? 'Oui' : 'Non',
            implode(', ', array_map(fn($u) => $u->getFirstName(), $e->getIntervenants()->toArray())),
            $this->getExpensesDocuments($e->getExpenses(), $format),
            $this->exportUtils->getLinkList($e->getDocuments(), $format),
            $e->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getCreatedBy()?->getFirstName() ?? '',
            $e->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getUpdatedBy()?->getFirstName() ?? ''
        ], $results);

        return [$headers, $rows];
    }

    private function getExpensesDocuments(?Collection $expenses, string $format): string 
    {
        if (!$expenses || $expenses->isEmpty()) return '';

        $linkList = '';
        foreach ($expenses as $expense) {
            $doc = $expense->getDocument();
            if (!\is_null($doc)) {
                $linkList .= $this->exportUtils->makeLink($doc, null, $format);
                $linkList .= $format === 'csv' ? "\n" : '<br>';
            }
        }
        return rtrim($linkList, $format === 'csv' ? "\n" : '<br>');

    }
}
