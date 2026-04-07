<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity]
#[ORM\Table(name: 'user_client_role')]
#[ORM\UniqueConstraint(name: 'unique_user_client', columns: ['user_id', 'client_id'])]
#[UniqueEntity(fields: ['user', 'client'], message: 'Cet utilisateur est déjà rattaché à ce client.')]
#[ApiFilter(SearchFilter::class, properties: ['client' => 'exact', 'user' => 'exact', 'role' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_USER")',
        ),
        new Get(
            security: 'is_granted("OIDC_USER")',
        ),
        new Post(
            security: 'is_granted("OIDC_ADMIN")',
        ),
        new Patch(
            security: 'is_granted("OIDC_ADMIN")',
        ),
        new Delete(
            security: 'is_granted("OIDC_ADMIN")',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['UserClientRole:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['UserClientRole:write'],
    ],
    order: ['user.lastName' => 'ASC'],
)]
class UserClientRole
{
    public const ROLE_ADMIN = 'admin';
    public const ROLE_PILOT = 'pilot';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['UserClientRole:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['UserClientRole:read', 'UserClientRole:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['UserClientRole:read', 'UserClientRole:write'])]
    private ?Client $client = null;

    #[ORM\Column(length: 20, options: ['default' => 'pilot'])]
    #[Groups(['UserClientRole:read', 'UserClientRole:write'])]
    private string $role = self::ROLE_PILOT;

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getClient(): ?Client { return $this->client; }
    public function setClient(?Client $client): static { $this->client = $client; return $this; }

    public function getRole(): string { return $this->role; }
    public function setRole(string $role): static { $this->role = $role; return $this; }

    public function isAdmin(): bool { return $this->role === self::ROLE_ADMIN; }
}
