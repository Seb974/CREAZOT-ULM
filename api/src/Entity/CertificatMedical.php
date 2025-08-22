<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CertificatMedicalRepository;
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

#[ORM\Entity(repositoryClass: CertificatMedicalRepository::class)]
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
        AbstractNormalizer::GROUPS => ['CertificatMedical:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['CertificatMedical:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true,
)]
class CertificatMedical
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'certificatMedical', cascade: ['persist'])]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Prestation:read', 'Reservation:read'])]
    private ?ProfilPilote $profil = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $type = null;

    #[ORM\Column(length: 150, nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $medecin = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $dateObtention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $validUntil = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?int $validityDurationMonths = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $remarques = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CertificatMedical:write', 'CertificatMedical:read', 'Profil_pilote:write', 'Profil_pilote:read', 'Prestation:read', 'Reservation:read'])]
    private ?bool $isAlertSent = null;

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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getMedecin(): ?string
    {
        return $this->medecin;
    }

    public function setMedecin(?string $medecin): static
    {
        $this->medecin = $medecin;

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

    public function getValidityDurationMonths(): ?int
    {
        return $this->validityDurationMonths;
    }

    public function setValidityDurationMonths(?int $validityDurationMonths): static
    {
        $this->validityDurationMonths = $validityDurationMonths;

        return $this;
    }

    public function getRemarques(): ?string
    {
        return $this->remarques;
    }

    public function setRemarques(?string $remarques): static
    {
        $this->remarques = $remarques;

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

    public function getIsAlertSent(): ?bool
    {
        return $this->isAlertSent;
    }

    public function setIsAlertSent(?bool $isAlertSent): static
    {
        $this->isAlertSent = $isAlertSent;

        return $this;
    }
}
