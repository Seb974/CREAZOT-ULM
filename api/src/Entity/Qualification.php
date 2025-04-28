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
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read'])]
    private ?string $nom = null;

    #[Groups(groups: ['Qualification:write', 'Qualification:read', 'Profil_pilote:read'])]
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
}
