<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity]
#[ORM\Table(name: 'flight_rule')]
#[ORM\HasLifecycleCallbacks]
#[ApiFilter(SearchFilter::class, properties: ['client' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(security: 'is_granted("OIDC_USER")'),
        new Get(security: 'is_granted("OIDC_USER")'),
        new Post(security: 'is_granted("OIDC_ADMIN")'),
        new Put(security: 'is_granted("OIDC_ADMIN")'),
        new Delete(security: 'is_granted("OIDC_ADMIN")'),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['FlightRule:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['FlightRule:write'],
    ],
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class FlightRule implements TenantAwareInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['FlightRule:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private ?Client $client = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private ?string $name = null;

    // --- Wind thresholds (knots) ---
    #[ORM\Column(options: ['default' => 18])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $limiteWindKts = 18;

    #[ORM\Column(options: ['default' => 25])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $maxWindKts = 25;

    #[ORM\Column(options: ['default' => 28])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $limiteGustKts = 28;

    #[ORM\Column(options: ['default' => 35])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $maxGustKts = 35;

    // --- Crosswind thresholds (knots) ---
    #[ORM\Column(options: ['default' => 10])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $limiteCrosswindKts = 10;

    #[ORM\Column(options: ['default' => 15])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $maxCrosswindKts = 15;

    // --- Visibility thresholds (meters) ---
    #[ORM\Column(options: ['default' => 5000])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $limiteVisibilityM = 5000;

    #[ORM\Column(options: ['default' => 3000])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $minVisibilityM = 3000;

    // --- Ceiling thresholds (feet AGL) ---
    #[ORM\Column(options: ['default' => 1500])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $limiteCeilingFt = 1500;

    #[ORM\Column(options: ['default' => 500])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $minCeilingFt = 500;

    // --- Runway QFU (kept for backward compat, removed from form) ---
    #[ORM\Column(nullable: true)]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private ?int $runwayQfu = null;

    // --- Day/Night margins (minutes) ---
    #[ORM\Column(options: ['default' => 30])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $dayMarginMinutes = 30;

    #[ORM\Column(options: ['default' => 30])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private int $nightMarginMinutes = 30;

    // --- NOTAM strategy: ai, block, warn, ignore ---
    #[ORM\Column(length: 10, options: ['default' => 'ai'])]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private string $notamStrategy = 'ai';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['FlightRule:read', 'FlightRule:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['FlightRule:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['FlightRule:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getClient(): ?Client { return $this->client; }
    public function setClient(?Client $client): static { $this->client = $client; return $this; }
    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): static { $this->name = $name; return $this; }

    public function getLimiteWindKts(): int { return $this->limiteWindKts; }
    public function setLimiteWindKts(int $v): static { $this->limiteWindKts = $v; return $this; }
    public function getMaxWindKts(): int { return $this->maxWindKts; }
    public function setMaxWindKts(int $v): static { $this->maxWindKts = $v; return $this; }
    public function getLimiteGustKts(): int { return $this->limiteGustKts; }
    public function setLimiteGustKts(int $v): static { $this->limiteGustKts = $v; return $this; }
    public function getMaxGustKts(): int { return $this->maxGustKts; }
    public function setMaxGustKts(int $v): static { $this->maxGustKts = $v; return $this; }
    public function getLimiteCrosswindKts(): int { return $this->limiteCrosswindKts; }
    public function setLimiteCrosswindKts(int $v): static { $this->limiteCrosswindKts = $v; return $this; }
    public function getMaxCrosswindKts(): int { return $this->maxCrosswindKts; }
    public function setMaxCrosswindKts(int $v): static { $this->maxCrosswindKts = $v; return $this; }
    public function getLimiteVisibilityM(): int { return $this->limiteVisibilityM; }
    public function setLimiteVisibilityM(int $v): static { $this->limiteVisibilityM = $v; return $this; }
    public function getMinVisibilityM(): int { return $this->minVisibilityM; }
    public function setMinVisibilityM(int $v): static { $this->minVisibilityM = $v; return $this; }
    public function getLimiteCeilingFt(): int { return $this->limiteCeilingFt; }
    public function setLimiteCeilingFt(int $v): static { $this->limiteCeilingFt = $v; return $this; }
    public function getMinCeilingFt(): int { return $this->minCeilingFt; }
    public function setMinCeilingFt(int $v): static { $this->minCeilingFt = $v; return $this; }
    public function getRunwayQfu(): ?int { return $this->runwayQfu; }
    public function setRunwayQfu(?int $v): static { $this->runwayQfu = $v; return $this; }
    public function getDayMarginMinutes(): int { return $this->dayMarginMinutes; }
    public function setDayMarginMinutes(int $v): static { $this->dayMarginMinutes = $v; return $this; }
    public function getNightMarginMinutes(): int { return $this->nightMarginMinutes; }
    public function setNightMarginMinutes(int $v): static { $this->nightMarginMinutes = $v; return $this; }
    public function getNotamStrategy(): string { return $this->notamStrategy; }
    public function setNotamStrategy(string $v): static { $this->notamStrategy = $v; return $this; }
    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $v): static { $this->notes = $v; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
}
