<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\Aeronef;
use App\Service\ClientGetter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AeronefQuotaSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private ClientGetter $clientGetter,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::VIEW => ['checkQuota', EventPriorities::PRE_WRITE]];
    }

    public function checkQuota(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$entity instanceof Aeronef || $method !== 'POST') {
            return;
        }

        $client = $this->clientGetter->get();
        if (!$client) {
            return;
        }

        $max = $client->getMaxAeronefs();
        if ($max === null) {
            return;
        }

        $count = (int) $this->em->createQuery(
            'SELECT COUNT(a.id) FROM App\Entity\Aeronef a WHERE a.client = :client'
        )->setParameter('client', $client)->getSingleScalarResult();

        if ($count >= $max) {
            throw new HttpException(403, "Quota d'aéronefs atteint (max: {$max}). Contactez-nous pour augmenter votre plan.");
        }
    }
}
