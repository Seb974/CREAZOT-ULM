<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ModulePackRepository;
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

#[ORM\Entity(repositoryClass: ModulePackRepository::class)]
#[ApiResource(
    uriTemplate: '/module-packs{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/module-packs/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/module-packs/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/module-packs/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/module-packs/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/module-packs/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['ModulePack:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['ModulePack:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true
)]
class ModulePack
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['ModulePack:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private array $modules = [];

    #[ORM\Column(options: ['default' => false])]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private bool $isDefault = false;

    #[ORM\Column(options: ['default' => 0])]
    #[Groups(groups: ['ModulePack:read', 'ModulePack:write'])]
    private int $sortOrder = 0;

    /**
     * @var Collection<int, ModulePackPrice>
     */
    #[ORM\OneToMany(targetEntity: ModulePackPrice::class, mappedBy: 'modulePack', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(groups: ['ModulePack:read'])]
    private Collection $modulePackPrices;

    public function __construct()
    {
        $this->modulePackPrices = new ArrayCollection();
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

    public function getModules(): array
    {
        return $this->modules;
    }

    public function setModules(array $modules): static
    {
        $this->modules = $modules;

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

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): static
    {
        $this->sortOrder = $sortOrder;

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
            $modulePackPrice->setModulePack($this);
        }

        return $this;
    }

    public function removeModulePackPrice(ModulePackPrice $modulePackPrice): static
    {
        if ($this->modulePackPrices->removeElement($modulePackPrice)) {
            if ($modulePackPrice->getModulePack() === $this) {
                $modulePackPrice->setModulePack(null);
            }
        }

        return $this;
    }
}
