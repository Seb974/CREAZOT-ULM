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
#[ORM\Table(name: "country_code")]
#[ApiResource(
    operations: [
        new GetCollection(paginationClientEnabled: true, paginationClientItemsPerPage: true, security: "true"),
        new Get(security: "true"),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['country_code:read']],
    denormalizationContext: ['groups' => ['country_code:write']],
    order: ['code' => 'ASC'],
)]
#[ApiFilter(SearchFilter::class, properties: ['code' => 'ipartial'])]
class CountryCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['country_code:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 10, unique: true)]
    #[Groups(['country_code:read', 'country_code:write', 'Client:read'])]
    private string $code = '';

    #[ORM\Column(length: 100)]
    #[Groups(['country_code:read', 'country_code:write', 'Client:read'])]
    private string $label = '';

    public function getId(): ?int { return $this->id; }

    public function getCode(): string { return $this->code; }

    public function setCode(string $code): static
    {
        $this->code = strtoupper(trim($code));
        return $this;
    }

    public function getLabel(): string { return $this->label; }

    public function setLabel(string $label): static
    {
        $this->label = trim($label);
        return $this;
    }

    public function __toString(): string { return $this->code . ' - ' . $this->label; }
}
