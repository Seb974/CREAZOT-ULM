<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PricingCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

#[ORM\Entity(repositoryClass: PricingCategoryRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    uriTemplate: '/pricing-categories{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/pricing-categories/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/pricing-categories/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/pricing-categories/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/pricing-categories/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/pricing-categories/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['PricingCategory:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['PricingCategory:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class PricingCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['PricingCategory:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?float $discountPercent = null;

    #[ORM\Column(options: ['default' => 10.0])]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private float $maintenanceDiscount = 10.0;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private bool $isDefault = false;

    #[ORM\Column(options: ['default' => true])]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private bool $isActive = true;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?\DateTimeImmutable $validFrom = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingCategory:read', 'PricingCategory:write'])]
    private ?\DateTimeImmutable $validUntil = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingCategory:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingCategory:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, PricingTier>
     */
    #[ORM\OneToMany(targetEntity: PricingTier::class, mappedBy: 'pricingCategory', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(groups: ['PricingCategory:read'])]
    private Collection $tiers;

    /**
     * @var Collection<int, ModulePackPrice>
     */
    #[ORM\OneToMany(targetEntity: ModulePackPrice::class, mappedBy: 'pricingCategory', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $modulePackPrices;

    public function __construct()
    {
        $this->tiers = new ArrayCollection();
        $this->modulePackPrices = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDiscountPercent(): ?float
    {
        return $this->discountPercent;
    }

    public function setDiscountPercent(?float $discountPercent): static
    {
        $this->discountPercent = $discountPercent;

        return $this;
    }

    public function getMaintenanceDiscount(): float
    {
        return $this->maintenanceDiscount;
    }

    public function setMaintenanceDiscount(float $maintenanceDiscount): static
    {
        $this->maintenanceDiscount = $maintenanceDiscount;

        return $this;
    }

    public function isDefault(): bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(bool $isDefault): static
    {
        $this->isDefault = $isDefault;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getValidFrom(): ?\DateTimeImmutable
    {
        return $this->validFrom;
    }

    public function setValidFrom(?\DateTimeImmutable $validFrom): static
    {
        $this->validFrom = $validFrom;

        return $this;
    }

    public function getValidUntil(): ?\DateTimeImmutable
    {
        return $this->validUntil;
    }

    public function setValidUntil(?\DateTimeImmutable $validUntil): static
    {
        $this->validUntil = $validUntil;

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

    /**
     * @return Collection<int, PricingTier>
     */
    public function getTiers(): Collection
    {
        return $this->tiers;
    }

    public function addTier(PricingTier $tier): static
    {
        if (!$this->tiers->contains($tier)) {
            $this->tiers->add($tier);
            $tier->setPricingCategory($this);
        }

        return $this;
    }

    public function removeTier(PricingTier $tier): static
    {
        if ($this->tiers->removeElement($tier)) {
            if ($tier->getPricingCategory() === $this) {
                $tier->setPricingCategory(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ModulePackPrice>
     */
    public function getModulePackPrices(): Collection
    {
        return $this->modulePackPrices;
    }

    public function addModulePackPrice(ModulePackPrice $modulePackPrice): static
    {
        if (!$this->modulePackPrices->contains($modulePackPrice)) {
            $this->modulePackPrices->add($modulePackPrice);
            $modulePackPrice->setPricingCategory($this);
        }

        return $this;
    }

    public function removeModulePackPrice(ModulePackPrice $modulePackPrice): static
    {
        if ($this->modulePackPrices->removeElement($modulePackPrice)) {
            if ($modulePackPrice->getPricingCategory() === $this) {
                $modulePackPrice->setPricingCategory(null);
            }
        }

        return $this;
    }
}
