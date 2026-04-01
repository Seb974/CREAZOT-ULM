<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\SiteSettings;
use App\Repository\SiteSettingsRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class SiteSettingsUniqueSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly SiteSettingsRepository $repository,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::VIEW => ['preventDuplicate', EventPriorities::PRE_WRITE]];
    }

    public function preventDuplicate(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$entity instanceof SiteSettings || $method !== 'POST') {
            return;
        }

        $existing = $this->repository->findInstance();
        if ($existing !== null) {
            throw new ConflictHttpException('Un enregistrement SiteSettings existe déjà. Utilisez PUT pour le modifier.');
        }
    }
}
