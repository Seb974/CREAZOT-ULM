<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LandingRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: LandingRepository::class)]
#[ApiResource(
    uriTemplate: '/landings{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/landings{._format}',
            paginationClientItemsPerPage: true,
        ),
        new Post(
            itemUriTemplate: '/landings/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/landings/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/landings/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/landings/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Landing:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Landing:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Landing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Landing:write', 'Vol:write', 'Prestation:write', 'Landing:read', 'Vol:read', 'Prestation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(groups: ['Landing:write', 'Vol:write', 'Prestation:write', 'Landing:read', 'Vol:read', 'Prestation:read'])]
    private ?string $airportCode = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Landing:write', 'Vol:write', 'Prestation:write', 'Landing:read', 'Vol:read', 'Prestation:read'])]
    private ?string $airportName = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Landing:write', 'Vol:write', 'Prestation:write', 'Landing:read', 'Vol:read', 'Prestation:read'])]
    private ?int $touches = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Landing:write', 'Vol:write', 'Prestation:write', 'Landing:read', 'Vol:read', 'Prestation:read'])]
    private ?int $complets = null;

    #[ORM\ManyToOne(inversedBy: 'landings')]
    #[Groups(groups: ['Landing:read', 'Landing:write'])]
    private ?Vol $vol = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAirportCode(): ?string
    {
        return $this->airportCode;
    }

    public function setAirportCode(?string $airportCode): static
    {
        $this->airportCode = $airportCode;

        return $this;
    }

    public function getAirportName(): ?string
    {
        return $this->airportName;
    }

    public function setAirportName(?string $airportName): static
    {
        $this->airportName = $airportName;

        return $this;
    }

    public function getTouches(): ?int
    {
        return $this->touches;
    }

    public function setTouches(?int $touches): static
    {
        $this->touches = $touches;

        return $this;
    }

    public function getComplets(): ?int
    {
        return $this->complets;
    }

    public function setComplets(?int $complets): static
    {
        $this->complets = $complets;

        return $this;
    }

    public function getVol(): ?Vol
    {
        return $this->vol;
    }

    public function setVol(?Vol $vol): static
    {
        $this->vol = $vol;

        return $this;
    }
}
