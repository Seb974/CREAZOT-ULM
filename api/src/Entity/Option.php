<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OptionRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: OptionRepository::class)]
#[ApiResource(
    uriTemplate: '/options{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/options/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/options/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/options/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/options/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/options/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Option:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Option:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Option
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Option:write', 'Option:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 60, nullable: true)]
    #[Groups(groups: ['Option:write', 'Option:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $nom = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Option:write', 'Option:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?float $prix = null;

    #[Groups(groups: ['Option:write', 'Option:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    public function getName(): ?string
    {
        return $this->nom;
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

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(?float $prix): static
    {
        $this->prix = $prix;

        return $this;
    }
}
