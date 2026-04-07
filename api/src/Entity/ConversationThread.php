<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\ConversationThreadRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ConversationThreadRepository::class)]
#[ORM\Table(name: 'conversation_thread')]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
        ),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['ConversationThread:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['ConversationThread:write'],
    ],
    order: ['createdAt' => 'DESC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
#[ApiFilter(SearchFilter::class, properties: ['status' => 'exact', 'channel' => 'exact', 'client' => 'exact'])]
class ConversationThread implements TenantAwareInterface
{
    use TenantAwareTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['ConversationThread:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $channel = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $customerName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $customerEmail = null;

    #[ORM\Column(length: 30, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $customerPhone = null;

    #[ORM\Column(length: 30, options: ['default' => 'pending'])]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private string $status = 'pending';

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?array $aiContext = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $summary = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?string $externalConversationId = null;

    #[ORM\OneToOne(targetEntity: Reservation::class, cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?Reservation $reservation = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(groups: ['ConversationThread:read', 'ConversationThread:write'])]
    private ?User $assignedTo = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['ConversationThread:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['ConversationThread:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getChannel(): ?string
    {
        return $this->channel;
    }

    public function setChannel(string $channel): static
    {
        $this->channel = $channel;
        return $this;
    }

    public function getCustomerName(): ?string
    {
        return $this->customerName;
    }

    public function setCustomerName(?string $customerName): static
    {
        $this->customerName = $customerName;
        return $this;
    }

    public function getCustomerEmail(): ?string
    {
        return $this->customerEmail;
    }

    public function setCustomerEmail(?string $customerEmail): static
    {
        $this->customerEmail = $customerEmail;
        return $this;
    }

    public function getCustomerPhone(): ?string
    {
        return $this->customerPhone;
    }

    public function setCustomerPhone(?string $customerPhone): static
    {
        $this->customerPhone = $customerPhone;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getAiContext(): ?array
    {
        return $this->aiContext;
    }

    public function setAiContext(?array $aiContext): static
    {
        $this->aiContext = $aiContext;
        return $this;
    }

    public function mergeAiContext(array $update): static
    {
        $this->aiContext = array_merge($this->aiContext ?? [], $update);
        return $this;
    }

    public function getSummary(): ?string
    {
        return $this->summary;
    }

    public function setSummary(?string $summary): static
    {
        $this->summary = $summary;
        return $this;
    }

    public function getExternalConversationId(): ?string
    {
        return $this->externalConversationId;
    }

    public function setExternalConversationId(?string $externalConversationId): static
    {
        $this->externalConversationId = $externalConversationId;
        return $this;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): static
    {
        $this->reservation = $reservation;
        return $this;
    }

    public function getAssignedTo(): ?User
    {
        return $this->assignedTo;
    }

    public function setAssignedTo(?User $assignedTo): static
    {
        $this->assignedTo = $assignedTo;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
