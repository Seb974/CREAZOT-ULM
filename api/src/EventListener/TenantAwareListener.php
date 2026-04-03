<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Client;
use App\Entity\TenantAwareInterface;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\HttpFoundation\RequestStack;

#[AsDoctrineListener(event: Events::prePersist)]
class TenantAwareListener
{
    public function __construct(
        private RequestStack $requestStack,
        private EntityManagerInterface $em,
    ) {}

    public function prePersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof TenantAwareInterface || $entity->getClient() !== null) {
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
