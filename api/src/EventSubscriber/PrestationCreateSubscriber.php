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
use Symfony\Component\Mailer\Mailer;
use App\Entity\Client;
use App\Entity\Vol;

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

        if (!$prestation instanceof Prestation || Request::METHOD_POST !== $method) 
            return;
        
        $aeronef = $prestation->getAeronef();
        $aeronef->setHorametre($prestation->getHorametreFin());

        if ( \is_null($aeronef->getSeuilAlerte()) )
            $aeronef->setSeuilAlerte(10);

        $this->setFlightsCost($prestation, $aeronef);
        $this->chekDeadlines($aeronef);
    }

    private function setFlightsCost(Prestation $prestation, Aeronef $aeronef): void
    {
        foreach ($prestation->getVols() as $vol) {
            $dafaultCost = $this->calculateFlightCost($prestation, $aeronef, $vol);
            $vol->setCout($dafaultCost);
        }
    }

    private function calculateFlightCost(Prestation $prestation, Aeronef $aeronef, Vol $vol): float
    {
        $circuit = $vol->getCircuit();
        if ($circuit->isPrixFixe())
            return $circuit->getCout() * $vol->getQuantite();
        else {
            if ($aeronef->isDecimal()) {
                $decimalResult = $vol->getDuree() * $circuit->getCout() * $vol->getQuantite();
                return $decimalResult;
            } else {
                $duree = floor($vol->getDuree()) + ($vol->getDuree() - floor($vol->getDuree())) / 60 * 100;
                $localeResult = $duree * $circuit->getCout() * $vol->getQuantite();
                return $localeResult;
            }
        }
    }

    private function chekDeadlines(Aeronef $aeronef): void
    {
        $client = $this->clientGetter->get();
        if (!$client->getEmailServer() || !$client->getEmailAddressSender()) 
            return;

        $mailer = $this->dynamicMailerFactory->getMailerForClient();

        if ( ($aeronef->getEntretien() - $aeronef->getHorametre()) < $aeronef->getSeuilAlerte() && !$aeronef->isAlerteEnvoyee())
            $this->notifyDeadline($mailer, $aeronef, $client, 'ENTRETIEN');

        if ( ($aeronef->getChangementMoteur() - $aeronef->getHorametre()) < $aeronef->getSeuilAlerteChangementMoteur() && !$aeronef->isAlerteMoteurEnvoyee())
            $this->notifyDeadline($mailer, $aeronef, $client, 'MOTEUR');
    }

    private function notifyDeadline(Mailer $mailer, Aeronef $aeronef, Client $client, string $type): void
    {
        $subject = $type == 'ENTRETIEN' ? 'Entretien proche sur ' : 'Changement moteur proche sur ';
        $template = $type == 'ENTRETIEN' ? 'maintenance.html.twig' : 'changement_moteur.html.twig';
        $entretien = $type == 'ENTRETIEN' ? $aeronef->getEntretien() : $aeronef->getChangementMoteur();
        $introduction = $type == 'ENTRETIEN' ?
            ($aeronef->getHorametre() > $aeronef->getEntretien() ? 'dépassée de' : 'programmée dans') :
            ($aeronef->getHorametre() > $aeronef->getChangementMoteur() ? 'dépassé de' : 'programmé dans');

        try {
                $message = (new TemplatedEmail())
                    ->from($client->getEmailAddressSender())
                    ->to($client->getEmail())
                    ->subject($subject . $aeronef->getImmatriculation())
                    ->htmlTemplate('emails/' . $template)
                    ->context([
                        'immatriculation' => $aeronef->getImmatriculation(),
                        'horametre' => $aeronef->getHorametre(),
                        'entretien' => $entretien,
                        'time' => $this->getRemainingTime($aeronef, $type),
                        'introduction' => $introduction, 
                        'client' => $client
                    ]);
    
                $mailer->send($message);
                $aeronef->setAlerteEnvoyee(true);
            } catch (\Throwable $e) {
                return;
            }
    }

    private function getRemainingTime(Aeronef $aeronef, $wantedInfo) : string
    {
        if ($wantedInfo == "ENTRETIEN")
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