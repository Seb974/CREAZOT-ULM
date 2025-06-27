<?php

namespace App\EventSubscriber;

use App\Entity\Payment;
use App\Repository\ReservationRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Request;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Doctrine\ORM\EntityManagerInterface;

class PaymentSubscriber implements EventSubscriberInterface
{
    private ReservationRepository $reservationRepository;
    private EntityManagerInterface $em;

    public function __construct(ReservationRepository $reservationRepository, EntityManagerInterface $em)
    {
        $this->reservationRepository = $reservationRepository;
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [KernelEvents::VIEW => ['onPostWrite', EventPriorities::POST_WRITE],];
    }

    public function onPostWrite(ViewEvent $event): void
    {
        $payment = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$payment instanceof Payment || $method !== Request::METHOD_POST)
            return;

        $reservationCode = $payment->getReservationCode();
        $reservations = [];

        if ($reservationCode) {
            $reservations = $this->reservationRepository->findBy(['code' => $reservationCode]);
        } else {
            $name = $payment->getName();
            $date = $payment->getDate();

            if (!$name || !$date)
                return;

            $reservations = $this->reservationRepository->findByNameAndDate($name, $date);
        }

        foreach ($reservations as $reservation) {
            $reservation->setPaid(true);
            $reservation->setPaymentReference($payment->getReference());
        }

        if (!empty($reservations)) {
            if (!$this->em)
                throw new \RuntimeException('Impossible de récupérer l\'EntityManager.');

            $this->em->flush();
        }
    }
}
