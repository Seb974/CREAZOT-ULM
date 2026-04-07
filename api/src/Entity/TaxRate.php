<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: "tax_rate")]
#[ApiResource(
    operations: [
        new GetCollection(paginationClientEnabled: true, paginationClientItemsPerPage: true),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['tax_rate:read']],
    denormalizationContext: ['groups' => ['tax_rate:write']],
    order: ['countryCode' => 'ASC', 'rate' => 'ASC'],
    security: "is_granted('ROLE_USER')",
)]
#[ApiFilter(SearchFilter::class, properties: ['countryCode.code' => 'exact'])]
class TaxRate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['tax_rate:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'float')]
    #[Groups(['tax_rate:read', 'tax_rate:write'])]
    private float $rate = 0.0;

    #[ORM\Column(length: 100)]
    #[Groups(['tax_rate:read', 'tax_rate:write'])]
    private string $label = '';

    #[ORM\ManyToOne(targetEntity: CountryCode::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['tax_rate:read', 'tax_rate:write'])]
    private ?CountryCode $countryCode = null;

    public function getId(): ?int { return $this->id; }

    public function getRate(): float { return $this->rate; }

    public function setRate(float $rate): static
    {
        $this->rate = $rate;
        return $this;
    }

    public function getLabel(): string { return $this->label; }

    public function setLabel(string $label): static
    {
        $this->label = trim($label);
        return $this;
    }

    public function getCountryCode(): ?CountryCode { return $this->countryCode; }

    public function setCountryCode(?CountryCode $countryCode): static
    {
        $this->countryCode = $countryCode;
        return $this;
    }
}
