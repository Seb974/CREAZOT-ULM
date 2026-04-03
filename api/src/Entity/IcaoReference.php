<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\IcaoReferenceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: IcaoReferenceRepository::class)]
#[ORM\Table(name: 'icao_reference')]
#[ApiResource(
    operations: [
        new GetCollection(paginationClientEnabled: true, paginationClientItemsPerPage: true),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['icao:read']],
    denormalizationContext: ['groups' => ['icao:write']],
    order: ['icao' => 'ASC'],
    security: "is_granted('ROLE_USER')",
)]
#[ApiFilter(SearchFilter::class, properties: ['icao' => 'ipartial'])]
class IcaoReference
{
    #[ORM\Id]
    #[ORM\Column(length: 4)]
    #[Groups(['icao:read', 'icao:write'])]
    private string $icao;

    public function getId(): string
    {
        return $this->icao;
    }

    public function getIcao(): string
    {
        return $this->icao;
    }

    public function setIcao(string $icao): static
    {
        $this->icao = strtoupper(trim($icao));
        return $this;
    }
}
