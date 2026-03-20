<?php
declare(strict_types=1);
namespace App\Security\Voter;

use App\Entity\TenantAwareInterface;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ClientTenantVoter extends Voter
{
    public const ACCESS_TENANT = 'TENANT_ACCESS';

    public function __construct(private Security $security) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::ACCESS_TENANT && $subject instanceof TenantAwareInterface;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }
        if ($this->security->isGranted('ROLE_SUPER_ADMIN')) {
            return true;
        }
        $client = $subject->getClient();
        if (!$client) {
            return false;
        }
        return $user->hasClient($client);
    }
}
