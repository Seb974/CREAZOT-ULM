<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PilotQualificationRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: PilotQualificationRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_USER")'
        ),
        new Post(
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            security: 'is_granted("OIDC_USER")',
        ),
        new Put(
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['PilotQualification:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['PilotQualification:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true,
)]
class PilotQualification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'pilotQualifications')]
    #[Groups(groups: ['PilotQualification:write', 'PilotQualification:read', 'Prestation:read', 'Reservation:read'])]
    private ?ProfilPilote $profil = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['PilotQualification:write', 'PilotQualification:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?Qualification $qualification = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PilotQualification:write', 'PilotQualification:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $dateObtention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PilotQualification:write', 'PilotQualification:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $validUntil = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PilotQualification:write', 'PilotQualification:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?bool $isAlertSent = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['PilotQualification:read', 'Profil_pilote:write'])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['PilotQualification:read', 'Profil_pilote:write'])]
    private ?User $updatedBy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PilotQualification:read', 'Profil_pilote:write'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PilotQualification:read', 'Profil_pilote:write'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[Groups(groups: ['PilotQualification:read', 'Profil_pilote:read', 'Profil_pilote:write'])]
    private ?MediaObject $document = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProfil(): ?ProfilPilote
    {
        return $this->profil;
    }

    public function setProfil(?ProfilPilote $profil): static
    {
        $this->profil = $profil;

        return $this;
    }

    public function getQualification(): ?Qualification
    {
        return $this->qualification;
    }

    public function setQualification(?Qualification $qualification): static
    {
        $this->qualification = $qualification;

        return $this;
    }

    public function getDateObtention(): ?\DateTimeImmutable
    {
        return $this->dateObtention;
    }

    public function setDateObtention(?\DateTimeImmutable $dateObtention): static
    {
        $this->dateObtention = $dateObtention;

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

    public function getIsAlertSent(): ?bool
    {
        return $this->isAlertSent;
    }

    public function setIsAlertSent(?bool $isAlertSent): static
    {
        $this->isAlertSent = $isAlertSent;

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

    public function getDocument(): ?MediaObject
    {
        return $this->document;
    }

    public function setDocument(?MediaObject $document): static
    {
        $this->document = $document;

        return $this;
    }
}
