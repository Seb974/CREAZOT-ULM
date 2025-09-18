<?php

namespace App\EventSubscriber;

use App\Entity\Option;
use App\Entity\Circuit;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ReservationGroupUpdateSubscriber implements EventSubscriberInterface
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::VIEW => ['onReservationUpdate', EventPriorities::POST_WRITE]];
    }

    public function onReservationUpdate(ViewEvent $event): void
    {
        $request = $event->getRequest();

        if (!in_array($request->getMethod(), [Request::METHOD_PUT, Request::METHOD_PATCH])) return;

        $reservation = $event->getControllerResult();
        if (!$reservation instanceof Reservation) return;

        $request = $event->getRequest();
        $content = json_decode($request->getContent(), true);
        $applyToGroup = $content['applyToGroup'] ?? false;

        if (!$applyToGroup) return;

        $reservations = $this->em->getRepository(Reservation::class)
                                 ->findBy(['code' => $reservation->getCode()]);

        foreach ($reservations as $res) {
            if ($res->getId() === $reservation->getId()) {
                continue;
            }
            $res->setNom($reservation->getNom())
                ->setTelephone($reservation->getTelephone())
                ->setCircuit($reservation->getCircuit())
                ->setDebut($reservation->getDebut())
                ->setFin($reservation->getFin())
                ->setColor($reservation->getColor())
                ->setStatut($reservation->getStatut())
                ->setRemarques($reservation->getRemarques())
                ->setReport($reservation->isReport())
                ->setEmail($reservation->getEmail())
                ->setPaid($reservation->isPaid())
                ->setUpsell($reservation->isUpsell())
                ->setContact($reservation->getContact())
                ->setOrigine($reservation->getOrigine());

            $updatedPrice = $this->getTotalPrice($res);
            $res->setPrix($updatedPrice);
        }
        $this->em->flush();
    }

    private function getTotalPrice(?Reservation $reservation): float
    {
        $circuitPrice = $reservation?->getCircuit()?->getPrix() ?? 0;
        $optionPrice  = $reservation?->getOption()?->getPrix() ?? 0;
        $maxOriginDiscount = !$reservation->getOrigine()->isEmpty()
            ? self::getMaxDiscountFromOrigin($reservation?->getOrigine())
            : 0;

        return ($circuitPrice * (1 - ($maxOriginDiscount / 100))) + $optionPrice;
    }

    private static function getMaxDiscountFromOrigin(Collection $origines): float
    {
        $max = 0;
        foreach ($origines as $origine) {
            $discount = $origine->getDiscount() ?? 0;
            if ($discount > $max) {
                $max = $discount;
            }
        }
        return $max;
    }
}
