<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CombinaisonRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: CombinaisonRepository::class)]
#[ApiResource(
    uriTemplate: '/combinaisons{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/combinaisons/{id}{._format}',
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.combinaison.min_passager'
            ],
        ),
        new Post(
            itemUriTemplate: '/combinaisons/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/combinaisons/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/combinaisons/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/combinaisons/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Combinaison:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Combinaison:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Combinaison
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Combinaison:write', 'Combinaison:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Combinaison:write', 'Combinaison:read'])]
    private ?string $nom = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Combinaison:write', 'Combinaison:read'])]
    private ?int $minPassager = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Combinaison:write', 'Combinaison:read'])]
    private ?float $prix = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Combinaison:write', 'Combinaison:read'])]
    private ?array $options = null;

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

    public function getMinPassager(): ?int
    {
        return $this->minPassager;
    }

    public function setMinPassager(?int $minPassager): static
    {
        $this->minPassager = $minPassager;

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

    public function getOptions(): ?array
    {
        return $this->options;
    }

    public function setOptions(?array $options): static
    {
        $this->options = $options;

        return $this;
    }
}
