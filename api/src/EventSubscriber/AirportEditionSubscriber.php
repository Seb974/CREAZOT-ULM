<?php

namespace App\EventSubscriber;

use App\Entity\Client;
use App\Entity\Airport;
use App\Service\ClientGetter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class AirportEditionSubscriber implements EventSubscriberInterface
{
    private ClientGetter $clientGetter;

    public function __construct(ClientGetter $clientGetter)
    {
        $this->clientGetter = $clientGetter;
    }

    public static function getSubscribedEvents()
    {
        return [ KernelEvents::VIEW => ['onAirportWrite', EventPriorities::PRE_WRITE] ];
    }

    public function onAirportWrite(ViewEvent $event): void
    {   
        $airport = $event->getControllerResult();
        $method = $event->getRequest()->getMethod(); 

        if (!$airport instanceof Airport || !in_array($method, [Request::METHOD_POST, Request::METHOD_PUT, Request::METHOD_PATCH])) 
            return;

        $client = $this->clientGetter->get();

        if (Request::METHOD_POST === $method && !\is_null($client)) {
            $airport->setClient($client);
        }

        if ($airport->isMain()) {
            $this->setNotMainToOtherAirports($airport, $client);
        }
    }

    private function setNotMainToOtherAirports(Airport $airport, ?Client $client) :void 
    {
        if (\is_null($client)) return;

        foreach ($client->getAirports() as $otherAirport) {
            if ($otherAirport !== $airport && $otherAirport->isMain()) {
                $otherAirport->setMain(false);
            }
        }
    }

}