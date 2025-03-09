<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\NatureRepository;
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

#[ORM\Entity(repositoryClass: NatureRepository::class)]
#[ApiResource(
    uriTemplate: '/natures{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/natures/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/natures/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/natures/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/natures/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/natures/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Nature:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Nature:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Nature
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Nature:write', 'Nature:read', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 15, nullable: true)]
    #[Groups(groups: ['Nature:write', 'Nature:read', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Nature:write', 'Nature:read', 'Circuit:read', 'Vol:read', 'Prestation:read', 'Reservation:read'])]
    private ?string $label = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
