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
        $user = $this->repository->findOneBy(['email' => $identifier]) ?: new User();
        $user->email = $identifier;

        if (!isset($attributes['preferred_username'])) {
            throw new UnsupportedUserException('Property "preferred_username" is missing in token attributes.');
        }
        $user->firstName = $attributes['preferred_username'];

        if (!isset($attributes['family_name'])) {
            throw new UnsupportedUserException('Property "family_name" is missing in token attributes.');
        }
        $user->lastName = $attributes['family_name'];

        if (!isset($attributes['realm_access'])) {
            throw new UnsupportedUserException('Property "realm_access" is missing in token attributes.');
        // } else if (array_key_exists('realm_access', $attributes) && array_key_exists('roles', $attributes['realm_access'])) {
        } else if (isset($attributes['realm_access']['roles'])) {
            $roles = in_array('admin', $attributes['realm_access']['roles']) ? ['ROLE_USER', 'OIDC_USER', 'ROLE_ADMIN', 'OIDC_ADMIN'] : ['ROLE_USER', 'OIDC_USER'];
            $user->setRoles($roles);
        }
        
        $this->repository->save($user, true);

        return $user;
    }
}
