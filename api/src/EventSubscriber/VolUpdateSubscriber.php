<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Vol;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class VolUpdateSubscriber implements EventSubscriberInterface
{
    private Security $security;

    public function __construct(Security $security) 
    {
        $this->security = $security;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['onVolUpdate', EventPriorities::PRE_WRITE],
        ];
    }

    public function onVolUpdate(ViewEvent $event): void
    {
        $vol = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$vol instanceof Vol || !in_array($method, [Request::METHOD_PUT, Request::METHOD_PATCH]))
            return;

        $user = $this->security->getUser();
        $vol->setUpdatedBy($user);
        $vol->setUpdatedAt(new \DateTimeImmutable());
    }
}
