<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Aeronef;
use App\Entity\Entretien;
use App\Entity\ProfilPilote;
use App\Entity\User;
use App\Entity\CarnetVol;
use App\Service\ClientGetter;
use App\Service\DynamicMailerFactory;
use App\Service\PilotValidityChecker;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class EntitiesMetaSubscriber implements EventSubscriberInterface
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['updateEntityMetas', EventPriorities::PRE_WRITE],
        ];
    }

    public function updateEntityMetas(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!in_array($method, [Request::METHOD_POST, Request::METHOD_PUT, Request::METHOD_PATCH])) {
            return;
        }

        $user = $this->security->getUser();

        // Aeronef OU Entretien
        if ($entity instanceof Aeronef || $entity instanceof Entretien || $entity instanceof CarnetVol) {
            $this->setEntityEditionMetas($entity, $user, $method);
        }

        // ProfilPilote + sous-entités
        if ($entity instanceof ProfilPilote) {
            $this->setEntityEditionMetas($entity, $user, $method, ['getCertificatMedical', 'getPilotQualifications']);
        }
    }

    /**
     * Met à jour les metas d'une entité et de ses relations
     *
     * @param object $entity
     * @param User|null $user
     * @param string $method
     * @param string[] $relations
     */
    private function setEntityEditionMetas(object $entity, ?User $user, string $method, array $relations = []): void
    {
        $now = new \DateTimeImmutable();

        if ($method === Request::METHOD_POST) {
            if (method_exists($entity, 'setCreatedAt')) $entity->setCreatedAt($now);
            if (method_exists($entity, 'setCreatedBy')) $entity->setCreatedBy($user);
        } else {
            if (method_exists($entity, 'setUpdatedAt')) $entity->setUpdatedAt($now);
            if (method_exists($entity, 'setUpdatedBy')) $entity->setUpdatedBy($user);
        }

        foreach ($relations as $relationGetter) {
            if (!method_exists($entity, $relationGetter)) continue;

            $relatedItems = $entity->$relationGetter();

            if ($relatedItems instanceof \Traversable || is_array($relatedItems)) {
                foreach ($relatedItems as $relatedItem) {
                    $this->setEntityEditionMetas($relatedItem, $user, $method);
                }
            } elseif ($relatedItems) {
                $this->setEntityEditionMetas($relatedItems, $user, $method);
            }
        }
    }
}
