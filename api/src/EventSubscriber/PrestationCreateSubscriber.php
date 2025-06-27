<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Aeronef;
use App\Entity\Prestation;
use App\Repository\AeronefRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use App\Service\DynamicMailerFactory;
use App\Service\ClientGetter;

final class PrestationCreateSubscriber implements EventSubscriberInterface
{
    private DynamicMailerFactory $dynamicMailerFactory;
    private ClientGetter $clientGetter;

    public function __construct(DynamicMailerFactory $dynamicMailerFactory, ClientGetter $clientGetter)
    {
        $this->dynamicMailerFactory = $dynamicMailerFactory;
        $this->clientGetter = $clientGetter;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::VIEW => ['updateHorametre', EventPriorities::PRE_WRITE],
        ];
    }

    public function updateHorametre(ViewEvent $event): void
    {   
        $prestation = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();
        $client = $this->clientGetter->get();

        if (!$prestation instanceof Prestation || Request::METHOD_POST !== $method) 
            return;
        
        $aeronef = $prestation->getAeronef();
        $aeronef->setHorametre($prestation->getHorametreFin());

        if ( \is_null($aeronef->getSeuilAlerte()) )
            $aeronef->setSeuilAlerte(10);

        if (!$client->getEmailServer() || !$client->getEmailAddressSender()) 
            return;

        $mailer = $this->dynamicMailerFactory->getMailerForClient();
        
        if ( ($aeronef->getEntretien() - $aeronef->getHorametre()) < $aeronef->getSeuilAlerte() && !$aeronef->isAlerteEnvoyee()) {
            try {
                $message = (new TemplatedEmail())
                ->from($client->getEmailAddressSender())
                ->to($client->getEmail())
                ->subject('Entretien proche sur ' . $aeronef->getImmatriculation())
                ->htmlTemplate('emails/maintenance.html.twig')
                ->context([
                    'immatriculation' => $aeronef->getImmatriculation(),
                    'horametre' => $aeronef->getHorametre(),
                    'entretien' => $aeronef->getEntretien(),
                    'time' => $this->getRemainingTime($aeronef, 'ENTRETIEN'),
                    'introduction' => $aeronef->getHorametre() > $aeronef->getEntretien() ? 'dépassée de' : 'programmée dans',
                    'client' => $client
                ]);
    
            $mailer->send($message);
            $aeronef->setAlerteEnvoyee(true);

            } catch (\Throwable $e) {
                return;
            }
        }

        if ( ($aeronef->getChangementMoteur() - $aeronef->getHorametre()) < $aeronef->getSeuilAlerteChangementMoteur() && !$aeronef->isAlerteMoteurEnvoyee()) {
            try {
                $message = (new TemplatedEmail())
                    ->from($client->getEmailAddressSender())
                    ->to($client->getEmail())
                    ->subject('Changement moteur proche sur ' . $aeronef->getImmatriculation())
                    ->htmlTemplate('emails/changement_moteur.html.twig')
                    ->context([
                        'immatriculation' => $aeronef->getImmatriculation(),
                        'horametre' => $aeronef->getHorametre(),
                        'entretien' => $aeronef->getEntretien(),
                        'time' => $this->getRemainingTime($aeronef, 'MOTEUR'),
                        'introduction' => $aeronef->getHorametre() > $aeronef->getEntretien() ? 'dépassé de' : 'programmé dans', 
                        'client' => $client
                    ]);
    
                $mailer->send($message);
                $aeronef->setAlerteEnvoyee(true);
            } catch (\Throwable $e) {
                return;
            }
        }
    }

    private function getRemainingTime(Aeronef $aeronef, $wantedInfo) : string
    {
        if ($wantedInfo === "ENTRETIEN")
            $decimal = $aeronef->isDecimal() ? $aeronef->getEntretien() : $this->getDecimalTimeFromLocale($aeronef->getEntretien());
        else 
            $decimal = $aeronef->isDecimal() ? $aeronef->getChangementMoteur() : $this->getDecimalTimeFromLocale($aeronef->getChangementMoteur());

        $decimalHorametre = $aeronef->isDecimal() ? $aeronef->getHorametre() : $this->getDecimalTimeFromLocale($aeronef->getHorametre());

        return $this->getRemains($decimal, $decimalHorametre);
    }

    private function getRemains(float $decimal, float $decimalHorametre) : string
    {
        $remainingDecimalTime = $decimal - $decimalHorametre;
        $intRemainingTime = abs($remainingDecimalTime);
        $restRemainingTime = abs($remainingDecimalTime) - $intRemainingTime;
        $formattedRest = round($restRemainingTime * 60, 0) < 10 ? "0" . round($restRemainingTime * 60, 0) : round($restRemainingTime * 60, 0);
 
        return $intRemainingTime . "h" . $formattedRest;
    }

    private function getDecimalTimeFromLocale(float $duration) : float
    {
        return floor($duration) + round(($duration - floor($duration)) / 60, 0) * 100;
    }
}