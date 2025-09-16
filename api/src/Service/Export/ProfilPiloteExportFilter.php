<?php

namespace App\Service\Export;

use App\Entity\User;
use App\Entity\ProfilPilote;
use App\Entity\CertificatMedical;
use App\Service\Export\ExportUtils;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class ProfilPiloteExportFilter implements ExportFilterInterface
{
    public function __construct(private EntityManagerInterface $em, private ExportUtils $exportUtils) {}

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

    public function formatExport(array $results, string $format = 'csv'): array
    {
        $headers = ['Id', 'Identité', 'Heures de vol', 'Certificat Médical', 'Obtention', 'Fin de validité',
        'Qualification', 'Obtention', 'Fin de validité', 'Autres documents', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = [];

        foreach ($results as $profil) {
            $pilote = $profil->getPilote();
            $certificatMedical = $profil->getCertificatMedical();
            $qualifications = $profil->getPilotQualifications();
            $documents = $this->exportUtils->getLinkList($profil->getDocuments(), $format);
            $first = true;

            if (count($qualifications ) > 0) {
                foreach ($qualifications as $q) { 
                    $rows[] = [
                        $first ? $profil->getId() ?? '' : '',
                        $first ? $this->getIndentity($pilote, $format) ?? '' : '',
                        $first ? $this->getDecimalToHourMinute($profil?->getTotalFlightHours()) ?? '' : '',
                        $first ? $this->getMedicalCertificate($certificatMedical, $format) ?? '' : '',
                        $first ? $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '' : '',
                        $first ? $this->getValidity($certificatMedical?->getValidUntil()) ?? '' : '',
                        $this->exportUtils->makeLink(
                            $q->getDocument(), 
                            $q->getQualification()?->getNom(),
                            $format
                        ) ?? '',
                        $q->getDateObtention()?->format('Y-m-d') ?? '',
                        $this->getValidity($q->getValidUntil()) ?? '',
                        $first ? $documents ?? '' : '',
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
                    $this->getIndentity($pilote, $format) ?? '',
                    $this->getDecimalToHourMinute($profil?->getTotalFlightHours()) ?? '',
                    $this->getMedicalCertificate($certificatMedical, $format) ?? '',
                    $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '',
                    $this->getValidity($certificatMedical?->getValidUntil()) ?? '',
                    '',
                    '',
                    '',
                    $documents ?? '',
                    $profil->getCreatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getCreatedBy()?->getFirstName() ?? '',
                    $profil->getUpdatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getUpdatedBy()?->getFirstName() ?? ''
                ];
            }
        }

        return [$headers, $rows];
    }

    private function getIndentity(?User $pilote, string $format): string 
    {
        if (is_null($pilote)) return '';

        $firstName = $pilote->getFirstName() ?? '';
        $email = $pilote->getEmail() ?? '';

        return $this->getBrokenLines($firstName, $email, $format);
    }

    private function getMedicalCertificate(?CertificatMedical $certificatMedical, string $format): string 
    {
        if (is_null($certificatMedical)) return '';

        $document = $certificatMedical->getDocument();
        $type = $this->getCertificatName($certificatMedical->getType());

        $documentLink = $this->exportUtils->makeLink($document, $type, $format) ?? '';
        $medecin = $certificatMedical->getMedecin() ?? '';
        $medecin = !empty($medecin) ? 'Délivré par ' . $medecin : '';

        return $this->getBrokenLines($documentLink, $medecin, $format);
    }

    private function getBrokenLines(string $line1, string $line2, string $format): string 
    {
        if (!empty($line1) && !empty($line2)) {
            return $line1 . ($format === 'csv' ? "\n" : '<br>') . $line2;
        }

        return $line1 ?: $line2;
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
