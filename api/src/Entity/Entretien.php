<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\EntretienRepository;
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

#[ORM\Entity(repositoryClass: EntretienRepository::class)]
#[ApiResource(
    uriTemplate: '/entretiens{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/entretiens/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/entretiens/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/entretiens/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/entretiens/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/entretiens/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Entretien:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Entretien:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Entretien
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?Aeronef $aeronef = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?string $intervention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?float $horametreIntervention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?float $horametreNextIntervention = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(?\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getAeronef(): ?Aeronef
    {
        return $this->aeronef;
    }

    public function setAeronef(?Aeronef $aeronef): static
    {
        $this->aeronef = $aeronef;

        return $this;
    }

    public function getIntervention(): ?string
    {
        return $this->intervention;
    }

    public function setIntervention(?string $intervention): static
    {
        $this->intervention = $intervention;

        return $this;
    }

    public function getHorametreIntervention(): ?float
    {
        return $this->horametreIntervention;
    }

    public function setHorametreIntervention(?float $horametreIntervention): static
    {
        $this->horametreIntervention = $horametreIntervention;

        return $this;
    }

    public function getHorametreNextIntervention(): ?float
    {
        return $this->horametreNextIntervention;
    }

    public function setHorametreNextIntervention(?float $horametreNextIntervention): static
    {
        $this->horametreNextIntervention = $horametreNextIntervention;

        return $this;
    }
}
