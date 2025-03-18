<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Entretien;
use App\Repository\AeronefRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;

final class EntretienCreateSubscriber implements EventSubscriberInterface
{

    public function __construct()
    {}

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::VIEW => ['updateHorametres', EventPriorities::PRE_WRITE],
        ];
    }

    public function updateHorametres(ViewEvent $event): void
    {   
        $entretien = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$entretien instanceof Entretien || Request::METHOD_POST !== $method) {
            return;
        }

        $aeronef = $entretien->getAeronef();
        $entretien->setHorametreIntervention($aeronef->getHorametre());
        $aeronef->setEntretien($entretien->getHorametreNextIntervention());
        $aeronef->setAlerteEnvoyee(false);
    }
}