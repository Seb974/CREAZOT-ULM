<?php

namespace App\Service\Export;

use App\Entity\Passager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class PassagerExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Passager::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb = $this->em->getRepository(Passager::class)->createQueryBuilder('pa');

        if (!empty($params['date']) && is_array($params['date'])) {
            if (!empty($params['date']['after'])) {
                $qb->andWhere('pa.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
            }
            if (!empty($params['date']['before'])) {
                $qb->andWhere('pa.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
            }
        }

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Date', 'Nom', 'Prenom', 'Telephone', 'Email', 'Consentement', 'Datetime', 'Texte accepté'];

        $rows = array_map(fn(Passager $p) => [
            $p->getId(),
            $p->getDate()?->format('Y-m-d') ?? '',
            $p->getNom(),
            $p->getPrenom(),
            $p->getTelephone(),
            $p->getEmail(),
            !empty($p->isConsentAccepted()) ? ($p->isConsentAccepted() ? 'Oui' : 'Non') : '',
            !empty($p->isConsentAccepted()) ? ($p->getConsentDatetime()?->format('Y-m-d H:i:s') ?? '') : '',
            !empty($p->isConsentAccepted()) ? ($p->getConsentText() ?? '') : '',
        ], $results);
        
        return [$headers, $rows];
    }
}
