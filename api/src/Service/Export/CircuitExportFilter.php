<?php

namespace App\Service\Export;

use App\Entity\Circuit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class CircuitExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === Circuit::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(Circuit::class)
                    ->createQueryBuilder('c');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Code', 'Nom', 'Code e-commerce', 'Type de vol', 'Durée', 'Prix Fixe', 
            'Prix', 'Coût',  'Option(s) possible(s)', 'Qualification(s) nécessaire(s)', 
            'Encadrant nécessaire', 'Déclaration des atterrissages', 'Atterrissage par défaut'];

        $rows = array_map(fn(Circuit $c) => [
            $c->getId() ?? '',
            $c->getCode() ?? '',
            $c->getNom() ?? '',
            $c->getWebshopId() ?? '',
            $c->getNature()?->getLabel() ?? '',
            $c->getDuree()?->format('H:i') ?? '',
            $c->isPrixFixe() ? 'Oui' : 'Non',
            $c->getPrix() ?? '',
            $c->getCout() ?? '',
            $c->isAvecOptions() ? 'Oui' : 'Non',
            implode(', ', array_map(fn($q) => $q->getNom(), $c->getQualifications()->toArray())),
            $c->isNeedsEncadrant() ? 'Oui' : 'Non',
            $c->isRequireLandingDeclaration() ? 'Oui' : 'Non',
            $c->isHadDefaultLanding() ? 'Oui' : 'Non'
        ], $results);
        
        return [$headers, $rows];
    }
}
