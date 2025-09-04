<?php

namespace App\EventSubscriber;

use App\Entity\Client;
use App\Entity\Camera;
use App\Service\ClientGetter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class CameraEditionSubscriber implements EventSubscriberInterface
{
    private ClientGetter $clientGetter;

    public function __construct(ClientGetter $clientGetter)
    {
        $this->clientGetter = $clientGetter;
    }

    public static function getSubscribedEvents()
    {
        return [ KernelEvents::VIEW => ['onCameraCreate', EventPriorities::PRE_WRITE] ];
    }

    public function onCameraCreate(ViewEvent $event): void
    {   
        $camera = $event->getControllerResult();
        $method = $event->getRequest()->getMethod(); 

        if (!$camera instanceof Camera || Request::METHOD_POST !== $method) 
            return;

        $client = $this->clientGetter->get();
        $camera->setClient($client);

    }
}