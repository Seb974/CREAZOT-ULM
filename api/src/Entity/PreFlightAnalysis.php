<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Metadata\ApiFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity]
#[ORM\Table(name: 'pre_flight_analysis')]
#[ApiFilter(SearchFilter::class, properties: ['client' => 'exact', 'pilot' => 'exact', 'result' => 'exact', 'icaoCode' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt' => 'DESC'])]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            security: 'is_granted("OIDC_USER")',
        ),
        new Get(security: 'is_granted("OIDC_USER")'),
        new Post(security: 'is_granted("OIDC_USER")'),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['PreFlightAnalysis:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['PreFlightAnalysis:write'],
    ],
    order: ['createdAt' => 'DESC'],
    security: 'is_granted("OIDC_USER")',
)]
class PreFlightAnalysis implements TenantAwareInterface
{
    public const RESULT_GO = 'go';
    public const RESULT_LIMITE = 'limite';
    public const RESULT_NOGO = 'nogo';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['PreFlightAnalysis:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private ?Client $client = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private ?User $pilot = null;

    #[ORM\Column(length: 10)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private ?string $icaoCode = null;

    #[ORM\Column(length: 10)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private string $result = self::RESULT_GO;

    #[ORM\Column(type: 'json')]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private array $details = [];

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private ?string $metarRaw = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private ?string $tafRaw = null;

    #[ORM\Column(options: ['default' => 0])]
    #[Groups(['PreFlightAnalysis:read', 'PreFlightAnalysis:write'])]
    private int $notamCount = 0;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['PreFlightAnalysis:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getClient(): ?Client { return $this->client; }
    public function setClient(?Client $client): static { $this->client = $client; return $this; }
    public function getPilot(): ?User { return $this->pilot; }
    public function setPilot(?User $pilot): static { $this->pilot = $pilot; return $this; }
    public function getIcaoCode(): ?string { return $this->icaoCode; }
    public function setIcaoCode(?string $v): static { $this->icaoCode = $v; return $this; }
    public function getResult(): string { return $this->result; }
    public function setResult(string $v): static { $this->result = $v; return $this; }
    public function getDetails(): array { return $this->details; }
    public function setDetails(array $v): static { $this->details = $v; return $this; }
    public function getMetarRaw(): ?string { return $this->metarRaw; }
    public function setMetarRaw(?string $v): static { $this->metarRaw = $v; return $this; }
    public function getTafRaw(): ?string { return $this->tafRaw; }
    public function setTafRaw(?string $v): static { $this->tafRaw = $v; return $this; }
    public function getNotamCount(): int { return $this->notamCount; }
    public function setNotamCount(int $v): static { $this->notamCount = $v; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
