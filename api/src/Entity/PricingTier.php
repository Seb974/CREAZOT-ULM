<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PricingTierRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: PricingTierRepository::class)]
#[ApiResource(
    uriTemplate: '/pricing-tiers{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/pricing-tiers/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/pricing-tiers/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/pricing-tiers/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/pricing-tiers/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/pricing-tiers/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['PricingTier:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['PricingTier:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true
)]
class PricingTier
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['PricingTier:read', 'PricingCategory:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: PricingCategory::class, inversedBy: 'tiers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(groups: ['PricingTier:read', 'PricingTier:write'])]
    private ?PricingCategory $pricingCategory = null;

    #[ORM\Column]
    #[Groups(groups: ['PricingTier:read', 'PricingTier:write', 'PricingCategory:read'])]
    private ?int $minAeronefs = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PricingTier:read', 'PricingTier:write', 'PricingCategory:read'])]
    private ?int $maxAeronefs = null;

    #[ORM\Column]
    #[Groups(groups: ['PricingTier:read', 'PricingTier:write', 'PricingCategory:read'])]
    private ?float $pricePerAeronef = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPricingCategory(): ?PricingCategory
    {
        return $this->pricingCategory;
    }

    public function setPricingCategory(?PricingCategory $pricingCategory): static
    {
        $this->pricingCategory = $pricingCategory;

        return $this;
    }

    public function getMinAeronefs(): ?int
    {
        return $this->minAeronefs;
    }

    public function setMinAeronefs(int $minAeronefs): static
    {
        $this->minAeronefs = $minAeronefs;

        return $this;
    }

    public function getMaxAeronefs(): ?int
    {
        return $this->maxAeronefs;
    }

    public function setMaxAeronefs(?int $maxAeronefs): static
    {
        $this->maxAeronefs = $maxAeronefs;

        return $this;
    }

    public function getPricePerAeronef(): ?float
    {
        return $this->pricePerAeronef;
    }

    public function setPricePerAeronef(float $pricePerAeronef): static
    {
        $this->pricePerAeronef = $pricePerAeronef;

        return $this;
    }
}
