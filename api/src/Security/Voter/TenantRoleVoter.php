<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\User;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Résout OIDC_ADMIN / OIDC_USER en se basant sur la table user_client_role
 * plutôt que sur les rôles globaux Keycloak du user.
 *
 * Logique :
 *  - ROLE_SUPER_ADMIN → bypass total (rôle global)
 *  - OIDC_ADMIN → l'utilisateur a role='admin' dans user_client_role pour le client courant
 *  - OIDC_USER  → l'utilisateur a une entrée (admin ou pilot) pour le client courant
 */
class TenantRoleVoter extends Voter
{
    private const SUPPORTED = ['OIDC_ADMIN', 'OIDC_USER'];

    /** Cache par requête : "userId:clientId" → role|null */
    private array $cache = [];

    public function __construct(
        private readonly Connection $connection,
        private readonly RequestStack $requestStack,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, self::SUPPORTED, true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        if (in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return false;
        }

        $clientId = $request->headers->get('X-Client-Id');
        if (!$clientId) {
            return false;
        }

        $role = $this->resolveRole($user, (int) $clientId);

        if ($role === null) {
            return false;
        }

        return match ($attribute) {
            'OIDC_USER' => true,
            'OIDC_ADMIN' => $role === 'admin',
            default => false,
        };
    }

    private function resolveRole(User $user, int $clientId): ?string
    {
        $userId = (string) $user->getId();
        $cacheKey = $userId . ':' . $clientId;

        if (array_key_exists($cacheKey, $this->cache)) {
            return $this->cache[$cacheKey];
        }

        $role = $this->connection->fetchOne(
            'SELECT role FROM user_client_role WHERE user_id = :uid AND client_id = :cid LIMIT 1',
            ['uid' => $userId, 'cid' => $clientId]
        );

        $this->cache[$cacheKey] = $role ?: null;

        return $this->cache[$cacheKey];
    }
}
