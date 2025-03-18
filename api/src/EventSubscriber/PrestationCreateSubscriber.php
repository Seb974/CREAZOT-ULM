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

final class PrestationCreateSubscriber implements EventSubscriberInterface
{
    private $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
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

        if (!$prestation instanceof Prestation || Request::METHOD_POST !== $method) {
            return;
        }

        $aeronef = $prestation->getAeronef();
        $aeronef->setHorametre($prestation->getHorametreFin());

        if ( \is_null($aeronef->getSeuilAlerte()) )
            $aeronef->setSeuilAlerte(10);
        
        if ( ($aeronef->getEntretien() - $aeronef->getHorametre()) < $aeronef->getSeuilAlerte() && !$aeronef->isAlerteEnvoyee()) {
            $message = (new TemplatedEmail())
                ->from('contact@planetair974.com')
                ->to('planetair974@gmail.com')
                ->subject('Entretien proche sur ' . $aeronef->getImmatriculation())
                ->htmlTemplate('emails/maintenance.html.twig')
                ->context([
                    'immatriculation' => $aeronef->getImmatriculation(),
                    'horametre' => $aeronef->getHorametre(),
                    'entretien' => $aeronef->getEntretien(),
                    'time' => $this->getRemainingTime($aeronef),
                    'introduction' => $aeronef->getHorametre() > $aeronef->getEntretien() ? 'dépassée de' : 'programmée dans'
                ]);

            $this->mailer->send($message);
            $aeronef->setAlerteEnvoyee(true);
        }
    }

    private function getRemainingTime(Aeronef $aeronef) : string
    {
        $decimalEntretien = $aeronef->isDecimal() ? $aeronef->getEntretien() : $this->getDecimalTimeFromLocale($aeronef->getEntretien());
        $decimalHorametre = $aeronef->isDecimal() ? $aeronef->getHorametre() : $this->getDecimalTimeFromLocale($aeronef->getHorametre());

        return $this->getRemains($decimalEntretien, $decimalHorametre);
    }

    private function getRemains(float $decimalEntretien, float $decimalHorametre) : string
    {
        $remainingDecimalTime = $decimalEntretien - $decimalHorametre;
        $intRemainingTime = abs(floor($remainingDecimalTime));
        $restRemainingTime = abs($remainingDecimalTime) - $intRemainingTime;
        $formattedRest = round($restRemainingTime * 60, 0) < 10 ? "0" . round($restRemainingTime * 60, 0) : round($restRemainingTime * 60, 0);
 
        return $intRemainingTime . "h" . $formattedRest;
    }

    private function getDecimalTimeFromLocale(float $duration) : float
    {
        return floor($duration) + round(($duration - floor($duration)) / 60, 0) * 100;
    }
}