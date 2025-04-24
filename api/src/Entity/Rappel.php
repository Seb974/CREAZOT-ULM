<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\RappelRepository;
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

#[ORM\Entity(repositoryClass: RappelRepository::class)]
#[ApiResource(
    uriTemplate: '/rappels{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/rappels/{id}{._format}',
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.rappel.date',
                'app.filter.rappel.periode'            ],
        ),
        new Post(
            itemUriTemplate: '/rappels/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/rappels/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/rappels/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/rappels/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Rappel:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Rappel:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Rappel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?string $titre = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?bool $recurrent = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?int $jour = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?bool $important = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Rappel:write', 'Rappel:read'])]
    private ?bool $finished = null;

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

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(?string $titre): static
    {
        $this->titre = $titre;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function isRecurrent(): ?bool
    {
        return $this->recurrent;
    }

    public function setRecurrent(?bool $recurrent): static
    {
        $this->recurrent = $recurrent;

        return $this;
    }

    public function getJour(): ?int
    {
        return $this->jour;
    }

    public function setJour(?int $jour): static
    {
        $this->jour = $jour;

        return $this;
    }

    public function isImportant(): ?bool
    {
        return $this->important;
    }

    public function setImportant(?bool $important): static
    {
        $this->important = $important;

        return $this;
    }

    public function isFinished(): ?bool
    {
        return $this->finished;
    }

    public function setFinished(?bool $finished): static
    {
        $this->finished = $finished;

        return $this;
    }
}
