<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\User;
use App\Entity\UserClientRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[AsEventListener(event: KernelEvents::REQUEST, priority: 6)]
class ClientRoleListener
{
    public function __construct(
        private TokenStorageInterface $tokenStorage,
        private EntityManagerInterface $em,
    ) {}

    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $token = $this->tokenStorage->getToken();
        if (!$token) {
            return;
        }

        $user = $token->getUser();
        if (!$user instanceof User) {
            return;
        }

        if (in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return;
        }

        $clientId = $event->getRequest()->headers->get('X-Client-Id');
        if (!$clientId) {
            return;
        }

        $ucr = $this->em->getRepository(UserClientRole::class)->findOneBy([
            'user' => $user,
            'client' => (int) $clientId,
        ]);

        $currentRoles = $user->getRoles();
        $cleanRoles = array_values(array_diff($currentRoles, ['ROLE_ADMIN', 'OIDC_ADMIN']));

        if ($ucr && $ucr->isAdmin()) {
            $cleanRoles[] = 'ROLE_ADMIN';
            $cleanRoles[] = 'OIDC_ADMIN';
        }

        $user->setRoles(array_unique($cleanRoles));
    }
}
