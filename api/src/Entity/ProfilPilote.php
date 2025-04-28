<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProfilPiloteRepository;
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

#[ORM\Entity(repositoryClass: ProfilPiloteRepository::class)]
#[ApiResource(
    uriTemplate: '/profil_pilotes{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/profil_pilotes/{id}{._format}',
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_ADMIN") or object.pilote == user',
            filters: [
                'app.filter.profile.pilote',
                'app.filter.profile.eleve',
                'app.filter.profile.professionnel',
                'app.filter.profile.instructeur',
            ],
        ),
        new Post(
            itemUriTemplate: '/profil_pilotes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Get(
            uriTemplate: '/profil_pilotes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN") or object.pilote == user'
        ),
        new Put(
            uriTemplate: '/profil_pilotes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/profil_pilotes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Profil_pilote:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Profil_pilote:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true,
)]
class ProfilPilote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist'])]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?User $pilote = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?bool $isEleve = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?bool $isPro = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?bool $isInstructeur = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPilote(): ?User
    {
        return $this->pilote;
    }

    public function setPilote(?User $pilote): static
    {
        $this->pilote = $pilote;

        return $this;
    }

    public function getIsEleve(): ?bool
    {
        return $this->isEleve;
    }

    public function setIsEleve(?bool $isEleve): static
    {
        $this->isEleve = $isEleve;

        return $this;
    }

    public function getIsPro(): ?bool
    {
        return $this->isPro;
    }

    public function setIsPro(?bool $isPro): static
    {
        $this->isPro = $isPro;

        return $this;
    }

    public function getIsInstructeur(): ?bool
    {
        return $this->isInstructeur;
    }

    public function setIsInstructeur(?bool $isInstructeur): static
    {
        $this->isInstructeur = $isInstructeur;

        return $this;
    }
}
