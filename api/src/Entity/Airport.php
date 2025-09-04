<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AirportRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\ApiFilter;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: AirportRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Airport:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Airport:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Airport
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Airport:write', 'Airport:read', 'Client:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(groups: ['Airport:write', 'Airport:read', 'Client:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Airport:write', 'Airport:read', 'Client:read'])]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Airport:write', 'Airport:read', 'Client:read'])]
    private ?bool $main = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Airport:write', 'Airport:read', 'Client:read'])]
    private ?bool $meteo = null;

    #[ORM\ManyToOne(inversedBy: 'airports')]
    #[Groups(groups: ['Airport:write'])]
    private ?Client $client = null;

    /**
     * @var Collection<int, MediaObject>
     */
    #[ORM\OneToMany(targetEntity: MediaObject::class, mappedBy: 'airport')]
    #[Groups(groups: ['Airport:write', 'Airport:read'])]
    private Collection $documents;

    #[Groups(groups: ['Airport:read', 'Client:read'])]
    public function getNom(): ?string
    {
        $code = $this->code ?? '';
        $name = $this->name ?? '';
        return trim($code . ' ' . $name);
    }

    public function __construct()
    {
        $this->documents = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): static
    {
        $this->code = $code;

        return $this;
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

    public function isMain(): ?bool
    {
        return $this->main;
    }

    public function setMain(?bool $main): static
    {
        $this->main = $main;

        return $this;
    }

    public function isMeteo(): ?bool
    {
        return $this->meteo;
    }

    public function setMeteo(?bool $meteo): static
    {
        $this->meteo = $meteo;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Collection<int, MediaObject>
     */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(MediaObject $document): static
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setAirport($this);
        }

        return $this;
    }

    public function removeDocument(MediaObject $document): static
    {
        if ($this->documents->removeElement($document)) {
            // set the owning side to null (unless already changed)
            if ($document->getAirport() === $this) {
                $document->setAirport(null);
            }
        }

        return $this;
    }
}
