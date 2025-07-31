<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OrigineRepository;
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

#[ORM\Entity(repositoryClass: OrigineRepository::class)]
#[ApiResource(
    uriTemplate: '/origines{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/origines/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/origines/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/origines/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/origines/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/origines/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Origine:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Origine:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Origine
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Origine:write', 'Origine:read', 'Cadeau:read', 'Reservation:read', 'PaymentDetail:read', 'Payment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Origine:write', 'Origine:read', 'Cadeau:read', 'Reservation:read', 'PaymentDetail:read', 'Payment:read'])]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Origine:write', 'Origine:read', 'Cadeau:read', 'Reservation:read', 'PaymentDetail:read', 'Payment:read'])]
    private ?float $discount = null;

    #[Groups(groups: ['Origine:write', 'Origine:read', 'Cadeau:read', 'Reservation:read', 'PaymentDetail:read', 'Payment:read'])]
    public function getLabel(): ?string
    {
        return $this->name;
    }

    #[Groups(groups: ['Origine:write', 'Origine:read', 'Cadeau:read', 'Reservation:read', 'PaymentDetail:read', 'Payment:read'])]
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

    public function getDiscount(): ?float
    {
        return $this->discount;
    }

    public function setDiscount(?float $discount): static
    {
        $this->discount = $discount;

        return $this;
    }
}
