<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ContactRepository;
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

#[ORM\Entity(repositoryClass: ContactRepository::class)]
#[ApiResource(
    uriTemplate: '/contacts{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/contacts/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/contacts/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/contacts/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/contacts/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/contacts/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Contact:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Contact:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Contact
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Contact:write', 'Contact:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Contact:write', 'Contact:read', 'Reservation:read'])]
    private ?string $name = null;

    #[Groups(groups: ['Contact:write', 'Contact:read', 'Reservation:read'])]
    public function getLabel(): ?string
    {
        return $this->name;
    }

    #[Groups(groups: ['Contact:write', 'Contact:read', 'Reservation:read'])]
    public function getValue(): ?string
    {
        return $this->name;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }
}
