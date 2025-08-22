<?php

namespace App\Service;

use App\Entity\User;
use App\Service\ClientGetter;
use Symfony\Component\Mime\Email;
use App\Service\DynamicMailerFactory;

class PilotValidityChecker
{
    public function __construct(private DynamicMailerFactory $dynamicMailerFactory, private ClientGetter $clientGetter) {}

    public function checkAndNotify(User $user, int $threshold = 30): void
    {
        $profil = $user->getProfilPilote();
        if (!$profil) return; 

        $alerts = [];
        $client = $this->clientGetter->get();

        $certificatMedical = $profil->getCertificatMedical();
        if ($certificatMedical && !$certificatMedical->getIsAlertSent() && $this->isValidityBelowThreshold($certificatMedical->getValidUntil() ?? null, $threshold)) {
            $validUntil = $certificatMedical->getValidUntil();
            if ($validUntil) {
                $alerts[] = $this->formatValidityAlert("certificat médical", $validUntil);
                $certificatMedical->setIsAlertSent(true);
            }
        }

        foreach ($profil->getPilotQualifications() as $qualification) {
            $validUntil = $qualification->getValidUntil();
            if (!$qualification->getIsAlertSent() && $this->isValidityBelowThreshold($validUntil ?? null, $threshold)) {
                if ($validUntil) {
                    $alerts[] = $this->formatValidityAlert("qualification '" . $qualification->getName() . "'", $validUntil);
                    $qualification->setIsAlertSent(true); 
                }
            }
        }

        if (!empty($alerts)) {
            try {
                $mailer = $this->dynamicMailerFactory->getMailerForClient();
                $body = "Bonjour {$user->getFirstName()},\n\n" .
                        "Nous vous rappelons que :\n" .
                        implode("\n", $alerts) .
                        "\n\nMerci de régulariser avant expiration.";
                $email = (new Email())
                    ->from($client->getEmailAddressSender())
                    ->to($user->getEmail())
                    ->subject('Alerte validité de vos documents de pilote')
                    ->text($body);
                $mailer->send($email);
            } catch (\Throwable $e) {
                return;
            }
        }
    }

    private function isValidityBelowThreshold(?\DateTimeInterface $validUntil, int $threshold): bool
    {
        if ($validUntil === null) return false;

        $today = new \DateTimeImmutable('today');

        // Déjà expiré -> considéré comme "en dessous du seuil"
        if ($validUntil < $today) return true;

        $diff = $today->diff($validUntil);
        return $diff->days <= $threshold;
    }

    private function formatValidityAlert(string $label, \DateTimeInterface $validUntil): string
    {
        $today = new \DateTimeImmutable('today');
        $diff = $today->diff($validUntil);

        if ($validUntil < $today) {
            return sprintf(
                "Votre %s est expiré depuis le %s (%d jours).",
                $label,
                $validUntil->format('d/m/Y'),
                $diff->days
            );
        }

        return sprintf(
            "Votre %s expire le %s (%d jours restants).",
            $label,
            $validUntil->format('d/m/Y'),
            $diff->days
        );
    }
}
