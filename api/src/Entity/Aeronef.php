<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AeronefRepository;
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

#[ORM\Entity(repositoryClass: AeronefRepository::class)]
#[ApiResource(
    uriTemplate: '/aeronefs{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/aeronefs/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/aeronefs/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/aeronefs/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/aeronefs/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/aeronefs/{id}{._format}',
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
class Aeronef
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read', 'Reservation:read'])]
    private ?string $immatriculation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read',])]
    private ?float $horametre = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read'])]
    private ?float $entretien = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Aeronef:write', 'Aeronef:read', 'Prestation:read', 'Vol:read'])]
    private ?bool $decimal = null;

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
}
