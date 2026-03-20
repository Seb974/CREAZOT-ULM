<?php
declare(strict_types=1);
namespace App\EventSubscriber;

use App\Entity\Client;
use App\Entity\TenantAwareInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use ApiPlatform\Symfony\EventListener\EventPriorities;

class TenantAssignSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private RequestStack $requestStack,
        private EntityManagerInterface $em,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::VIEW => ['assignClient', EventPriorities::PRE_WRITE]];
    }

    public function assignClient(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();
        if (!$entity instanceof TenantAwareInterface || $method !== 'POST' || $entity->getClient() !== null) {
            return;
        }
        $request = $this->requestStack->getCurrentRequest();
        $clientId = $request?->headers->get('X-Client-Id');
        if (!$clientId) {
            return;
        }
        $client = $this->em->getRepository(Client::class)->find((int) $clientId);
        if ($client) {
            $entity->setClient($client);
        }
    }
}
