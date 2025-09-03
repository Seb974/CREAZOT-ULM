<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\DisponibiliteRepository;
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

#[ORM\Entity(repositoryClass: DisponibiliteRepository::class)]
#[ORM\Table(
    name: 'disponibilite',
    indexes: [
        new ORM\Index(name: 'idx_disponibilite_pilote', columns: ['pilote_id']),
        new ORM\Index(name: 'idx_disponibilite_debut_fin', columns: ['debut', 'fin']),
        new ORM\Index(name: 'idx_disponibilite_pilote_debut_fin', columns: ['pilote_id', 'debut', 'fin']),
    ]
)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.disponibilite.debut',
                'app.filter.disponibilite.fin'
                ]
        ),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Disponibilite:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Disponibilite:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
)]
class Disponibilite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Disponibilite:write', 'Disponibilite:read'])]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Disponibilite:write', 'Disponibilite:read'])]
    private ?\DateTimeImmutable $debut = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Disponibilite:write', 'Disponibilite:read'])]
    private ?\DateTimeImmutable $fin = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Disponibilite:write', 'Disponibilite:read'])]
    private ?string $motif = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Disponibilite:write', 'Disponibilite:read'])]
    private ?ProfilPilote $pilote = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDebut(): ?\DateTimeImmutable
    {
        return $this->debut;
    }

    public function setDebut(?\DateTimeImmutable $debut): static
    {
        $this->debut = $debut;

        return $this;
    }

    public function getFin(): ?\DateTimeImmutable
    {
        return $this->fin;
    }

    public function setFin(?\DateTimeImmutable $fin): static
    {
        $this->fin = $fin;

        return $this;
    }

    public function getMotif(): ?string
    {
        return $this->motif;
    }

    public function setMotif(?string $motif): static
    {
        $this->motif = $motif;

        return $this;
    }

    public function getPilote(): ?ProfilPilote
    {
        return $this->pilote;
    }

    public function setPilote(?ProfilPilote $pilote): static
    {
        $this->pilote = $pilote;

        return $this;
    }
}
