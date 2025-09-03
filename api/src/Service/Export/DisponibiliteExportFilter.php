<?php

namespace App\Service\Export;

use App\Entity\Disponibilite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class DisponibiliteExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Disponibilite::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Disponibilite::class)
                    ->createQueryBuilder('d');

        foreach ($params as $key => $value) {
            if (empty($value) && $value !== '0') continue;

            switch ($key) {
                case 'debut':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('r.debut >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('r.debut <= :before')->setParameter('before', $before);
                    }
                    break;
                case 'fin':
                    if (!empty($value['after'])) {
                        $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                        $qb->andWhere('r.fin >= :after')->setParameter('after', $after);
                    }
                    if (!empty($value['before'])) {
                        $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                        $qb->andWhere('r.fin <= :before')->setParameter('before', $before);
                    }
                    break;
            }
        }
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
        $headers = ['Id', 'Pilote', 'Type', 'Debut', 'Fin', 'Motif'];

        $rows = array_map(fn(Disponibilite $d) => [
            $d->getId() ?? '',
            $d->getPilote()?->getPilote()?->getFirstName() ?? '',
            $this->getType($d),
            $d->getDebut()?->format('Y-m-d') ?? '',
            $d->getFin()?->format('Y-m-d') ?? '',
            $d->getMotif() ?? ''
        ], $results);

        return [$headers, $rows];
    }

    private function getType(Disponibilite $disponibilite): string 
    {
        if (!$disponibilite) return '';
        return $disponibilite?->getPilote()?->getAvailableByDefault() ? 'Indisponibilité' : 'Disponibilité';
    }
}
