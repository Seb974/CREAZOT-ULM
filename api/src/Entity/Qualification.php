<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\QualificationRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: QualificationRepository::class)]
#[ApiResource(
    uriTemplate: '/qualifications{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/qualifications/{id}{._format}',
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_USER")'
        ),
        new Post(
            itemUriTemplate: '/qualifications/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/qualifications/{id}{._format}',
            security: 'is_granted("OIDC_USER")',
        ),
        new Put(
            uriTemplate: '/qualifications/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/qualifications/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Qualification:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Qualification:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true,
)]
class Qualification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
    private ?string $nom = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
    private ?bool $encadrant = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
    private ?string $color = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
    private ?string $slug = null;

    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read', 'Circuit:read'])]
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

    public function isEncadrant(): ?bool
    {
        return $this->encadrant;
    }

    public function setEncadrant(?bool $encadrant): static
    {
        $this->encadrant = $encadrant;

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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }
}
