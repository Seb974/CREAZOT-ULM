<?php

namespace App\EventSubscriber;

use App\Entity\CarnetVol;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

use App\Service\ClientGetter;
use App\Entity\Client;
use App\Entity\User;

final class CarnetVolEditSubscriber implements EventSubscriberInterface
{
    private ClientGetter $clientGetter;
    private Security $security;

    public function __construct(ClientGetter $clientGetter, Security $security)
    {
        $this->clientGetter = $clientGetter;
        $this->security = $security;
    }

    public static function getSubscribedEvents()
    {
        return [ KernelEvents::VIEW => ['updateData', EventPriorities::PRE_WRITE] ];
    }

    public function updateData(ViewEvent $event): void
    {   
        $carnetVol = $event->getControllerResult();
        $method = $event->getRequest()->getMethod(); 

        if (!$carnetVol instanceof CarnetVol || !in_array($method, [Request::METHOD_POST, Request::METHOD_PUT, Request::METHOD_PATCH])) 
            return;

        $user = $this->security->getUser();
        $this->setEditionMetas($carnetVol, $user, $method);
        
        if (Request::METHOD_POST === $method)
            $this->addFlightTimeToUser($carnetVol->getDuree(), $carnetVol?->getProfil()?->getPilote());
    }

    private function setEditionMetas(CarnetVol $carnetVol, ?User $user, string $method): void
    {
        if ($method === Request::METHOD_POST) {
            $carnetVol->setCreatedAt(new \DateTimeImmutable());
            $carnetVol->setCreatedBy($user);
        } else {
            $carnetVol->setUpdatedAt(new \DateTimeImmutable());
            $carnetVol->setUpdatedBy($user);
        }
    }

    private function addFlightTimeToUser(float $duration, User $user): void
    {
        $profilPilote = $user->getProfilPilote();
        if (!$profilPilote) return;

        $currentFlightTime = $profilPilote->getTotalFlightHours() ?? 0;
        $updatedFlightTime = $currentFlightTime + $duration;
        $profilPilote->setTotalFlightHours($updatedFlightTime);
    }
}