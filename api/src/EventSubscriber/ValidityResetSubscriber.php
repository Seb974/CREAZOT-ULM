<?php

namespace App\EventSubscriber;

use Doctrine\ORM\Events;
use App\Entity\ProfilPilote;
use App\Entity\CertificatMedical;
use App\Entity\PilotQualification;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ValidityResetSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['preUpdate', EventPriorities::PRE_WRITE],
        ];
    }

    public function preUpdate(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if ($entity instanceof ProfilPilote && in_array($method, [Request::METHOD_PUT, Request::METHOD_PATCH])) {
            $validitiesToCheck = array_merge(
                $entity->getCertificatMedical() ? [$entity->getCertificatMedical()] : [],
                $entity->getPilotQualifications() ? $entity->getPilotQualifications()->toArray() : []
            );

            foreach ($validitiesToCheck as $item) {
                $validUntil = $item->getValidUntil();
                if (($validUntil instanceof \DateTimeInterface && $validUntil > new \DateTimeImmutable('today')) || \is_null($validUntil)) {
                    $item->setIsAlertSent(false);
                }
            }
        }
    }
}
