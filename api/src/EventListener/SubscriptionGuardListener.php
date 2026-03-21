<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Service\ClientGetter;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class SubscriptionGuardListener
{
    private const BYPASS_PREFIXES = [
        '/auth/',
        '/oidc/',
        '/_next/',
        '/api/auth/',
    ];

    private const ALLOWED_API_PATHS = [
        '/clients',
        '/pricing-categories',
        '/module-packs',
        '/pricing-tiers',
        '/module-pack-prices',
    ];

    public function __construct(
        private ClientGetter $clientGetter,
        private Security $security,
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $path = $event->getRequest()->getPathInfo();

        foreach (self::BYPASS_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return;
            }
        }

        if (!str_starts_with($path, '/')) {
            return;
        }

        foreach (self::ALLOWED_API_PATHS as $allowed) {
            if (str_starts_with($path, $allowed)) {
                return;
            }
        }

        $client = $this->clientGetter->get();
        if (!$client) {
            return;
        }

        $status = $client->getSubscriptionStatus();
        if ($status !== 'suspended' && $status !== 'cancelled') {
            return;
        }

        $user = $this->security->getUser();
        if ($user && in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return;
        }

        $event->setResponse(new JsonResponse(
            ['error' => 'Abonnement suspendu. Contactez-nous pour réactiver votre compte.'],
            403
        ));
    }
}
