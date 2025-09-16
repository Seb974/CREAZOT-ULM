<?php

namespace App\Service\Export;

use App\Entity\CarnetVol;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

class CarnetVolExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private Security $security) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === CarnetVol::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $user = $this->security->getUser();
        $qb = $this->em->getRepository(CarnetVol::class)
                    ->createQueryBuilder('c')
                    ->leftJoin('c.profil', 'profil')
                    ->leftJoin('profil.pilote', 'pilote')
                    ->andWhere('LOWER(pilote.keycloakId) LIKE :pilote')
                    ->setParameter('pilote', '%' . strtolower($user?->getKeycloakId()) . '%');

        if (!empty($params['date']) && is_array($params['date'])) {
            if (!empty($params['date']['after'])) {
                $after = \DateTimeImmutable::createFromFormat('d/m/Y', $params['date']['after']);
                if (!$after) {
                    $after = new \DateTimeImmutable($params['date']['after']);
                }
                $qb->andWhere('c.date >= :after')->setParameter('after', $after);
            }
            if (!empty($params['date']['before'])) {
                $before = \DateTimeImmutable::createFromFormat('d/m/Y', $params['date']['before']);
                if (!$before) {
                    $before = new \DateTimeImmutable($params['date']['before']);
                }
                $qb->andWhere('c.date <= :before')->setParameter('before', $before);
            }
        }
        
        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
       $headers = [ 'Id','Date', 'Pilote', 'Aéronef', 'Type de vol', 'Durée', 'Lieu départ', 
                    'Lieux arrivée', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(CarnetVol $c) => [
            $c->getId(),
            $c->getDate()?->format('Y-m-d') ?? '',
            $c->getProfil()?->getPilote()?->getFirstName(),
            $c->getAeronef(),
            $c->getTypeDeVol()?->getLabel(),
            $this->getDecimalToHourMinute($c->getDuree()),
            $c->getLieuDepart(),
            implode(', ', $c->getLieuxArrivee() ?? []),
            $c->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $c->getCreatedBy()?->getFirstName(),
            $c->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $c->getUpdatedBy()?->getFirstName()
        ], $results);

        return [$headers, $rows];
    }

    private function getDecimalToHourMinute(float $decimalDuration): string
    {
        if (\is_null($decimalDuration)) return "00:00";

        $hours = floor($decimalDuration);
        $minutes = round(($decimalDuration - $hours) * 60);

        return sprintf('%02d:%02d', $hours, $minutes);
    }
}
