<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ReservationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
// use ApiPlatform\Core\Annotation\ApiFilter;
use Symfony\Component\Serializer\Annotation\Groups;
// use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\DateFilter;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;


#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ApiResource(
    uriTemplate: '/reservations{._format}',
    operations: [
        new GetCollection(
            // itemUriTemplate: '/reservations/{id}{._format}',
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.reservation.pilote',
                'app.filter.reservation.aeronef',
                'app.filter.reservation.circuit',
                'app.filter.reservation.date',
                'app.filter.reservation.client',
                'app.filter.reservation.validated'
            ],
        ),
        new Post(
            itemUriTemplate: '/reservations/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/reservations/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/reservations/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/reservations/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Reservation:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Reservation:write'],
    ],
    collectDenormalizationErrors: true,
    // security: 'is_granted("OIDC_USER")',
    mercure: true
)]
// #[ApiFilter(DateFilter::class, properties: ['debut', 'fin'])]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?string $telephone = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?int $quantite = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?Circuit $circuit = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?Option $option = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?float $prix = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?User $pilote = null;

    /**
     * @var DateTime
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?\DateTimeInterface $debut = null;

    /**
     * @var DateTime
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?\DateTimeInterface $fin = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?Aeronef $avion = null;

    #[ORM\Column(length: 60, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?string $color = null;

    #[ORM\Column(length: 80, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?string $statut = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Reservation:write', 'Reservation:read'])]
    private ?string $remarques = null;

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

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(?int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getCircuit(): ?Circuit
    {
        return $this->circuit;
    }

    public function setCircuit(?Circuit $circuit): static
    {
        $this->circuit = $circuit;

        return $this;
    }

    public function getOption(): ?Option
    {
        return $this->option;
    }

    public function setOption(?Option $option): static
    {
        $this->option = $option;

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

    public function getPilote(): ?User
    {
        return $this->pilote;
    }

    public function setPilote(?User $pilote): static
    {
        $this->pilote = $pilote;

        return $this;
    }

    public function getDebut(): ?\DateTimeInterface
    {
        return $this->debut;
    }

    public function setDebut(?\DateTimeInterface $debut): static
    {
        $this->debut = $debut;

        return $this;
    }

    public function getFin(): ?\DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(?\DateTimeInterface $fin): static
    {
        $this->fin = $fin;

        return $this;
    }

    public function getAvion(): ?Aeronef
    {
        return $this->avion;
    }

    public function setAvion(?Aeronef $avion): static
    {
        $this->avion = $avion;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(?string $statut): static
    {
        $this->statut = $statut;

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
}
