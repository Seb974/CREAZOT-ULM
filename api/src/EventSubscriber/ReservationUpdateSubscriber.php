<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Reservation;
use App\Repository\AeronefRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;

final class ReservationUpdateSubscriber implements EventSubscriberInterface
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
        $reservation = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$reservation instanceof Reservation || Request::METHOD_PUT !== $method) {
            return;
        }

        $cadeau = $reservation->getCadeau();
        if (!is_null($cadeau) && !$cadeau->isUsed())
            $cadeau->setUsed(true);
    }
}