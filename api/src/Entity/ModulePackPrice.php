<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ModulePackPriceRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ModulePackPriceRepository::class)]
#[ORM\UniqueConstraint(columns: ['module_pack_id', 'pricing_category_id'])]
#[ApiResource(
    uriTemplate: '/module-pack-prices{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/module-pack-prices/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/module-pack-prices/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/module-pack-prices/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/module-pack-prices/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/module-pack-prices/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['ModulePackPrice:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['ModulePackPrice:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class ModulePackPrice
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['ModulePackPrice:read', 'ModulePack:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ModulePack::class, inversedBy: 'modulePackPrices')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(groups: ['ModulePackPrice:read', 'ModulePackPrice:write'])]
    private ?ModulePack $modulePack = null;

    #[ORM\ManyToOne(targetEntity: PricingCategory::class, inversedBy: 'modulePackPrices')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(groups: ['ModulePackPrice:read', 'ModulePackPrice:write', 'ModulePack:read'])]
    private ?PricingCategory $pricingCategory = null;

    #[ORM\Column]
    #[Groups(groups: ['ModulePackPrice:read', 'ModulePackPrice:write', 'ModulePack:read'])]
    private ?float $monthlyPrice = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getModulePack(): ?ModulePack
    {
        return $this->modulePack;
    }

    public function setModulePack(?ModulePack $modulePack): static
    {
        $this->modulePack = $modulePack;

        return $this;
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

    public function getMonthlyPrice(): ?float
    {
        return $this->monthlyPrice;
    }

    public function setMonthlyPrice(float $monthlyPrice): static
    {
        $this->monthlyPrice = $monthlyPrice;

        return $this;
    }
}
