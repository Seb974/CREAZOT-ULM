<?php

declare(strict_types=1);

namespace App\Security\Core;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\AttributesBasedUserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @implements AttributesBasedUserProviderInterface<UserInterface|User>
 */
final readonly class UserProvider implements AttributesBasedUserProviderInterface
{
    public function __construct(private ManagerRegistry $registry, private UserRepository $repository)
    {
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        $manager = $this->registry->getManagerForClass($user::class);
        if (!$manager) {
            throw new UnsupportedUserException(\sprintf('User class "%s" not supported.', $user::class));
        }

        $manager->refresh($user);

        return $user;
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class;
    }

    /**
     * Create or update User on login.
     */
    public function loadUserByIdentifier(string $identifier, array $attributes = []): UserInterface
    {
        $user = null;

        if (!empty($attributes['sub'])) {
            $user = $this->repository->findOneBy(['keycloakId' => $attributes['sub']]);
        }

        if (!$user) {
            $user = $this->repository->findOneBy(['email' => $identifier]) ?: new User();
        }

        $user->email = $identifier;
        if (!empty($attributes['sub'])) {
            $user->setKeycloakId($attributes['sub']);
        }

        $user->firstName = $attributes['given_name'] ?? $user->firstName;
        $user->lastName  = $attributes['family_name'] ?? $user->lastName;

        if (!empty($attributes['realm_access']['roles'])) {
            $currentRoles = $user->getRoles();
            $newRoles = in_array('super_admin', $attributes['realm_access']['roles']) || in_array('admin', $attributes['realm_access']['roles'])
                ? ['ROLE_USER', 'OIDC_USER', 'ROLE_ADMIN', 'OIDC_ADMIN']
                : ['ROLE_USER', 'OIDC_USER'];
            $user->setRoles(array_unique(array_merge($currentRoles, $newRoles)));
        }

        $this->repository->save($user, true);

        return $user;
    }
}
