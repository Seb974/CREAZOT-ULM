<?php

namespace App\EventSubscriber;

use App\Entity\Payment;
use App\Repository\ReservationRepository;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class PaymentSubscriber implements EventSubscriberInterface
{
    private ReservationRepository $reservationRepository;

    public function __construct(ReservationRepository $reservationRepository)
    {
        $this->reservationRepository = $reservationRepository;
    }

    public static function getSubscribedEvents(): array
    {
        return [Events::postPersist];
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Payment) {
            return;
        }

        $entityManager = $args->getObjectManager();
        $reservationCode = $entity->getReservationCode();
        $reservations = [];

        if ($reservationCode) {
            // Cas 1 : recherche par code de réservation
            $reservations = $entityManager->getRepository(Reservation::class)->findBy([
                'reservationCode' => $reservationCode
            ]);
        } else {
            // Cas 2 : fallback sur name + date
            $name = $entity->getName();
            $date = $entity->getDate();

            // Si l'un des deux est manquant, on sort
            if (!$name || !$date) {
                return;
            }

            $reservations = $entityManager->getRepository(Reservation::class)->findBy([
                'name' => $name,
                'date' => $date,
            ]);
        }

        foreach ($reservations as $reservation) {
            $reservation->setPaid(true);
            $reservation->setPaymentReference($entity->getCode());
            $entityManager->persist($reservation);
        }

        if (count($reservations) > 0) {
            $entityManager->flush();
        }
    }
}
