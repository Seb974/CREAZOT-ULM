<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CircuitRepository;
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

#[ORM\Entity(repositoryClass: CircuitRepository::class)]
#[ApiResource(
    uriTemplate: '/circuits{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/circuits/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/circuits/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/circuits/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/circuits/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/circuits/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Circuit:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Circuit:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Circuit
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $code = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?float $prix = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?float $cout = null;

    #[ORM\Column(type: Types::TIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?\DateTimeInterface $duree = null;

    #[ORM\ManyToOne(targetEntity: Nature::class)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?Nature $nature = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?bool $prixFixe = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Circuit:write', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?bool $avecOptions = null;

    #[Groups(groups: ['Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    public function getName(): ?string
    {
        return $this->code;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(?string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(?float $prix): static
    {
        $this->prix = $prix;

        return $this;
    }

    public function getCout(): ?float
    {
        return $this->cout;
    }

    public function setCout(?float $cout): static
    {
        $this->cout = $cout;

        return $this;
    }

    public function getDuree(): ?\DateTimeInterface
    {
        return $this->duree;
    }

    public function setDuree(?\DateTimeInterface $duree): static
    {
        $this->duree = $duree;

        return $this;
    }

    public function getNature(): ?Nature
    {
        return $this->nature;
    }

    public function setNature(?Nature $nature): static
    {
        $this->nature = $nature;

        return $this;
    }

    public function isPrixFixe(): ?bool
    {
        return $this->prixFixe;
    }

    public function setPrixFixe(?bool $prixFixe): static
    {
        $this->prixFixe = $prixFixe;

        return $this;
    }

    public function isAvecOptions(): ?bool
    {
        return $this->avecOptions;
    }

    public function setAvecOptions(?bool $avecOptions): static
    {
        $this->avecOptions = $avecOptions;

        return $this;
    }
}
