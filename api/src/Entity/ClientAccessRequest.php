<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use App\Repository\ClientAccessRequestRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Entity\TenantAwareInterface;

#[ORM\Entity(repositoryClass: ClientAccessRequestRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiFilter(SearchFilter::class, properties: ['status' => 'exact', 'requestedBy' => 'exact'])]
#[ApiResource(
    uriTemplate: '/client_access_requests{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/client_access_requests/{id}{._format}',
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_USER")',
        ),
        new Post(
            itemUriTemplate: '/client_access_requests/{id}{._format}',
            security: 'is_granted("OIDC_USER")',
        ),
        new Get(
            uriTemplate: '/client_access_requests/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN") or object.getRequestedBy() === user',
        ),
        new Patch(
            uriTemplate: '/client_access_requests/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['ClientAccessRequest:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['ClientAccessRequest:write'],
    ],
    collectDenormalizationErrors: true,
    order: ['createdAt' => 'DESC'],
)]
class ClientAccessRequest implements TenantAwareInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['ClientAccessRequest:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(groups: ['ClientAccessRequest:read', 'ClientAccessRequest:write'])]
    private ?User $requestedBy = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(groups: ['ClientAccessRequest:read', 'ClientAccessRequest:write'])]
    private ?Client $client = null;

    #[ORM\Column(length: 20, options: ['default' => 'pending'])]
    #[Groups(groups: ['ClientAccessRequest:read', 'ClientAccessRequest:write'])]
    private ?string $status = 'pending';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(groups: ['ClientAccessRequest:read', 'ClientAccessRequest:write'])]
    private ?string $message = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['ClientAccessRequest:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['ClientAccessRequest:read'])]
    private ?\DateTimeImmutable $processedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(groups: ['ClientAccessRequest:read'])]
    private ?User $processedBy = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRequestedBy(): ?User
    {
        return $this->requestedBy;
    }

    public function setRequestedBy(?User $requestedBy): static
    {
        $this->requestedBy = $requestedBy;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getProcessedAt(): ?\DateTimeImmutable
    {
        return $this->processedAt;
    }

    public function setProcessedAt(?\DateTimeImmutable $processedAt): static
    {
        $this->processedAt = $processedAt;
        return $this;
    }

    public function getProcessedBy(): ?User
    {
        return $this->processedBy;
    }

    public function setProcessedBy(?User $processedBy): static
    {
        $this->processedBy = $processedBy;
        return $this;
    }
}
