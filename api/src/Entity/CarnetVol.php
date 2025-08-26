<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.carnet.pilote',
                'app.filter.carnet.aeronef',
                'app.filter.carnet.date'
            ],
        ),
        new Post(),
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['CarnetVol:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['CarnetVol:write'],
    ],
    order: ['date' => 'DESC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true,
)]
class CarnetVol
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['CarnetVol:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ProfilPilote::class, inversedBy: 'carnetVols')]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private ?ProfilPilote $profil = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private ?string $aeronef = null;

    #[ORM\ManyToOne(targetEntity: Nature::class)]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private ?Nature $typeDeVol = null;

    #[ORM\Column(type: 'float')]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private float $duree = 0.0;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private ?string $lieuDepart = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private array $lieuxArrivee = [];

    #[ORM\Column(type: 'boolean')]
    #[Groups(['CarnetVol:read', 'CarnetVol:write'])]
    private bool $isValidated = false;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['CarnetVol:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['CarnetVol:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['CarnetVol:read'])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['CarnetVol:read'])]
    private ?User $updatedBy = null;

    public function getId(): ?int { 
        return $this->id; 
    }

    public function getProfil(): ?ProfilPilote {
        return $this->profil; 
    }
    
    public function setProfil(?ProfilPilote $profil): self {
        $this->profil = $profil; 
        return $this; 
    }

    public function getDate(): ?\DateTimeImmutable { 
        return $this->date; 
    }

    public function setDate(\DateTimeImmutable $date): self {
        $this->date = $date; 
        return $this; 
    }

    public function getAeronef(): ?string {
        return $this->aeronef; 
    }

    public function setAeronef(?string $aeronef): self {
        $this->aeronef = $aeronef; 
        return $this; 
    }

    public function getTypeDeVol(): ?Nature
    {
        return $this->typeDeVol;
    }

    public function setTypeDeVol(?Nature $typeDeVol): self
    {
        $this->typeDeVol = $typeDeVol;
        return $this;
    }

    public function getDuree(): float { 
        return $this->duree; 
    }

    public function setDuree(float $duree): self { 
        $this->duree = $duree; 
        return $this; 
    }

    public function getLieuDepart(): ?string { 
        return $this->lieuDepart; 
    }
    public function setLieuDepart(?string $lieuDepart): self { 
        $this->lieuDepart = $lieuDepart; 
        return $this; 
    }

    public function getLieuxArrivee(): array
    {
        return $this->lieuxArrivee;
    }

    public function setLieuxArrivee(array $lieuxArrivee): self
    {
        $this->lieuxArrivee = $lieuxArrivee;
        return $this;
    }

    public function addLieuArrivee(string $lieu): self
    {
        if (!in_array($lieu, $this->lieuxArrivee, true)) {
            $this->lieuxArrivee[] = $lieu;
        }

        return $this;
    }

    public function removeLieuArrivee(string $lieu): self
    {
        $this->lieuxArrivee = array_filter(
            $this->lieuxArrivee,
            fn ($l) => $l !== $lieu
        );

        return $this;
    }

    public function getIsValidated(): bool { 
        return $this->isValidated; 
    }

    public function setIsValidated(bool $isValidated): self { 
        $this->isValidated = $isValidated; 
        return $this; 
    }

    public function getCreatedAt(): ?\DateTimeImmutable { 
        return $this->createdAt; 
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): self { 
        $this->createdAt = $createdAt; 
        return $this; 
    }

    public function getUpdatedAt(): ?\DateTimeImmutable { 
        return $this->updatedAt; 
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self { 
        $this->updatedAt = $updatedAt; 
        return $this; 
    }

    public function getCreatedBy(): ?User { 
        return $this->createdBy; 
    }

    public function setCreatedBy(?User $createdBy): self { 
        $this->createdBy = $createdBy; 
        return $this; 
    }

    public function getUpdatedBy(): ?User { 
        return $this->updatedBy; 
    }

    public function setUpdatedBy(?User $updatedBy): self { 
        $this->updatedBy = $updatedBy; 
        return $this; 
    }
}
