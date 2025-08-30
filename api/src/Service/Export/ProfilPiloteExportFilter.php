<?php

namespace App\Service\Export;

use App\Entity\ProfilPilote;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class ProfilPiloteExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function supports(string $entityClass): bool
    {
        return $entityClass === ProfilPilote::class;
    }

    public function getResults(Request $request): array
    {
        $params = $request->query->all();
        $qb =  $this->em->getRepository(ProfilPilote::class)
                    ->createQueryBuilder('p');

        return $qb->getQuery()->getResult();
    }

    public function formatExport(array $results): array
    {
        $headers = ['Id', 'Nom', 'E-mail', 'Heures de vol', 'Certificat Médical', 'Obtention', 'Fin de validité', 'Médecin',
        'Qualification', 'Obtention', 'Fin de validité', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = [];

        foreach ($results as $profil) {
            $pilote = $profil->getPilote();
            $certificatMedical = $profil->getCertificatMedical();
            $qualifications = $profil->getPilotQualifications();
            $first = true;

            if (count($qualifications ) > 0) {
                foreach ($qualifications as $q) { 
                    $rows[] = [
                        $first ? $profil->getId() ?? '' : '',
                        $first ? $pilote?->getFirstName() ?? '' : '',
                        $first ? $pilote?->getEmail() ?? '' : '',
                        $first ? $this->getDecimalToHourMinute($profil?->getTotalFlightHours()) ?? '' : '',
                        $first ? $this->getCertificatName($certificatMedical?->getType()) ?? '' : '',
                        $first ? $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '' : '',
                        $first ? $this->getValidity($certificatMedical?->getValidUntil()) ?? '' : '',
                        $first ? $certificatMedical?->getMedecin() ?? '' : '',
                        $q->getQualification()?->getNom() ?? '',
                        $q->getDateObtention()?->format('Y-m-d') ?? '',
                        $this->getValidity($q->getValidUntil()) ?? '',
                        $first ? $profil->getCreatedAt()?->format('Y-m-d H:i') ?? '' : '',
                        $first ? $profil->getCreatedBy()?->getFirstName() ?? '' : '',
                        $first ? $profil->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '',
                        $first ? $profil->getUpdatedBy()?->getFirstName() ?? '' : ''
                    ];
    
                    $first = false;
                }
            } else {
                $rows[] = [
                    $profil->getId() ?? '',
                    $pilote?->getFirstName() ?? '',
                    $pilote?->getEmail() ?? '',
                    $this->getDecimalToHourMinute($profil?->getTotalFlightHours()) ?? '',
                    $this->getCertificatName($certificatMedical?->getType()) ?? '',
                    $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '',
                    $this->getValidity($certificatMedical?->getValidUntil()) ?? '',
                    $certificatMedical?->getMedecin() ?? '',
                    '',
                    '',
                    '',
                    $profil->getCreatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getCreatedBy()?->getFirstName() ?? '',
                    $profil->getUpdatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getUpdatedBy()?->getFirstName() ?? ''
                ];
            }
        }

        return [$headers, $rows];
    }

    private function getDecimalToHourMinute(float $decimalDuration): string
    {
        if (\is_null($decimalDuration)) return "00:00";

        $hours = floor($decimalDuration);
        $minutes = round(($decimalDuration - $hours) * 60);

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getCertificatName(string $code): string 
    {
        $certificat = [
            'CL1'  => 'Certificat médical de Classe 1',
            'CL2'  => 'Certificat médical de Classe 2',
            'CA'   => 'Certificat d\'aptitude',
            'CNCI' => 'Certificat de non contre-indication',
            'CE'   => 'Certificat exceptionnel'
        ];

        return $certificat[$code] ?? '';
    }

    private function getValidity(?\DateTimeInterface $validUntil): string 
    {
        if (\is_null($validUntil)) return 'Sans limite';
        return $validUntil?->format('Y-m-d') ?? '';
    }
}
