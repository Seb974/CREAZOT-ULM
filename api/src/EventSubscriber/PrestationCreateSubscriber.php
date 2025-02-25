<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
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

    public function __construct()
    {}

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
        dump($aeronef);
        dump($prestation->getHorametreFin());
    }
}