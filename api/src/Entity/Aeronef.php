<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AeronefRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\ApiFilter;
use App\Doctrine\Orm\Filter\AvailableAeronefFilter;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use App\Entity\TenantAwareInterface;
use App\Entity\TenantAwareTrait;

#[ORM\Entity(repositoryClass: AeronefRepository::class)]
#[ApiResource(
    uriTemplate: '/aeronefs{._format}',
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            name: 'aeronefs_list',
            uriTemplate: '/aeronefs',
            filters: ['app.filter.aeronef.selectable'],
        ),
        new GetCollection(
            name: 'aeronefs_available',
            uriTemplate: '/aeronefs/disponibles',
            filters: [AvailableAeronefFilter::class]
        ),
        new Post(
            itemUriTemplate: '/aeronefs/{id}{._format}',
            security: 'is_granted("ROLE_SUPER_ADMIN")'
        ),
        new Get(
            uriTemplate: '/aeronefs/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/aeronefs/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/aeronefs/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Aeronef:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Aeronef:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
#[ApiFilter(AvailableAeronefFilter::class)]
class Aeronef implements TenantAwareInterface
{
    use TenantAwareTrait;
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read', 'Entretien:read', 'Landing:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read', 'Entretien:read', 'Landing:read'])]
    private ?string $immatriculation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Entretien:read'])]
    private ?float $horametre = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Entretien:write', 'Aeronef:read', 'Prestation:read', 'Entretien:read'])]
    private ?float $entretien = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Entretien:read'])]
    private ?float $seuilAlerte = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Entretien:read'])]
    private ?bool $decimal = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Entretien:read'])]
    private ?bool $alerteEnvoyee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Entretien:write', 'Aeronef:read', 'Prestation:read', 'Entretien:read'])]
    private ?float $changementMoteur = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Entretien:read'])]
    private ?float $seuilAlerteChangementMoteur = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Entretien:read'])]
    private ?bool $alerteMoteurEnvoyee = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read'])]
    private ?string $codeBalise = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Aeronef:read'])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Aeronef:read'])]
    private ?User $updatedBy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, MediaObject>
     */
    #[ORM\OneToMany(targetEntity: MediaObject::class, mappedBy: 'aeronef')]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read'])]
    private Collection $documents;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read', 'Entretien:read', 'Landing:read'])]
    private ?bool $isAvailable = null;

    public function __construct()
    {
        $this->documents = new ArrayCollection();
    }

    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read', 'Entretien:read', 'Landing:read'])]
    public function getName(): ?string
    {
        return $this->immatriculation;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getImmatriculation(): ?string
    {
        return $this->immatriculation;
    }

    public function setImmatriculation(?string $immatriculation): static
    {
        $this->immatriculation = $immatriculation;

        return $this;
    }

    public function getHorametre(): ?float
    {
        return $this->horametre;
    }

    public function setHorametre(?float $horametre): static
    {
        $this->horametre = $horametre;

        return $this;
    }

    public function getEntretien(): ?float
    {
        return $this->entretien;
    }

    public function setEntretien(?float $entretien): static
    {
        $this->entretien = $entretien;

        return $this;
    }

    public function isDecimal(): ?bool
    {
        return $this->decimal;
    }

    public function setDecimal(?bool $decimal): static
    {
        $this->decimal = $decimal;

        return $this;
    }

    public function getSeuilAlerte(): ?float
    {
        return $this->seuilAlerte;
    }

    public function setSeuilAlerte(?float $seuilAlerte): static
    {
        $this->seuilAlerte = $seuilAlerte;

        return $this;
    }

    public function isAlerteEnvoyee(): ?bool
    {
        return $this->alerteEnvoyee;
    }

    public function setAlerteEnvoyee(?bool $alerteEnvoyee): static
    {
        $this->alerteEnvoyee = $alerteEnvoyee;

        return $this;
    }

    public function getChangementMoteur(): ?float
    {
        return $this->changementMoteur;
    }

    public function setChangementMoteur(?float $changementMoteur): static
    {
        $this->changementMoteur = $changementMoteur;

        return $this;
    }

    public function getSeuilAlerteChangementMoteur(): ?float
    {
        return $this->seuilAlerteChangementMoteur;
    }

    public function setSeuilAlerteChangementMoteur(?float $seuilAlerteChangementMoteur): static
    {
        $this->seuilAlerteChangementMoteur = $seuilAlerteChangementMoteur;

        return $this;
    }

    public function isAlerteMoteurEnvoyee(): ?bool
    {
        return $this->alerteMoteurEnvoyee;
    }

    public function setAlerteMoteurEnvoyee(?bool $alerteMoteurEnvoyee): static
    {
        $this->alerteMoteurEnvoyee = $alerteMoteurEnvoyee;

        return $this;
    }

    public function getCodeBalise(): ?string
    {
        return $this->codeBalise;
    }

    public function setCodeBalise(?string $codeBalise): static
    {
        $this->codeBalise = $codeBalise;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    public function setUpdatedBy(?User $updatedBy): static
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection<int, MediaObject>
     */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(MediaObject $document): static
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setAeronef($this);
        }

        return $this;
    }

    public function removeDocument(MediaObject $document): static
    {
        if ($this->documents->removeElement($document)) {
            // set the owning side to null (unless already changed)
            if ($document->getAeronef() === $this) {
                $document->setAeronef(null);
            }
        }

        return $this;
    }

    public function getIsAvailable(): ?bool
    {
        return $this->isAvailable;
    }

    public function setIsAvailable(?bool $isAvailable): static
    {
        $this->isAvailable = $isAvailable;

        return $this;
    }
}
