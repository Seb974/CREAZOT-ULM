<?php

declare(strict_types=1);

namespace App\Entity;

use App\Dto\ClientInput;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ClientRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\CreateClientController;
use App\Controller\UpdateClientController;
use Symfony\Component\Serializer\Annotation\Groups;
use App\DataTransformer\ClientInputDataTransformer;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    uriTemplate: '/clients{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/clients/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            input: ClientInput::class,
            output: Client::class,
            uriTemplate: '/clients{._format}',
            processor: ClientInputDataTransformer::class,
            controller: CreateClientController::class,
            inputFormats: ['multipart' => ['multipart/form-data']],
            deserialize: false
        ), 
        new Get(
            uriTemplate: '/clients/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/clients/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/clients/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Client:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Client:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Client
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\NotBlank]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $slug = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $email = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Regex('/^[\d\s\+\-()]+$/', message: 'Numéro de téléphone invalide.')]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $logo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $favicon = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $pdfBackground = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $thanksImage = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $mapIcon = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Assert\Regex('/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?float $lat = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?float $lng = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?int $zoom = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?array $camIds = [];

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?array $airportCodes = [];

    #[ORM\Column(nullable: true)]
    #[Assert\Range(min: 0, max: 1)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?float $opacity = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $active = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $timezone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $address = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $zipcode = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $city = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getLogo(): string|UploadedFile|null
    {
        return $this->logo;
    }

    public function setLogo(string|UploadedFile|null $logo): static
    {
        $this->logo = $logo;

        return $this;
    }

    public function getFavicon(): string|UploadedFile|null
    {
        return $this->favicon;
    }

    public function setFavicon(string|UploadedFile|null $favicon): static
    {
        $this->favicon = $favicon;

        return $this;
    }

    public function getPdfBackground(): string|UploadedFile|null
    {
        return $this->pdfBackground;
    }

    public function setPdfBackground(string|UploadedFile|null $pdfBackground): static
    {
        $this->pdfBackground = $pdfBackground;

        return $this;
    }

    public function getMapIcon(): string|UploadedFile|null
    {
        return $this->mapIcon;
    }

    public function setMapIcon(string|UploadedFile|null $mapIcon): static
    {
        $this->mapIcon = $mapIcon;

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

    public function getLat(): ?float
    {
        return $this->lat;
    }

    public function setLat(?float $lat): static
    {
        $this->lat = $lat;

        return $this;
    }

    public function getLng(): ?float
    {
        return $this->lng;
    }

    public function setLng(?float $lng): static
    {
        $this->lng = $lng;

        return $this;
    }

    public function getZoom(): ?int
    {
        return $this->zoom;
    }

    public function setZoom(?int $zoom): static
    {
        $this->zoom = $zoom;

        return $this;
    }

    public function getCamIds(): ?array
    {
        return $this->camIds;
    }

    public function setCamIds(?array $camIds): static
    {
        $this->camIds = $camIds;

        return $this;
    }

    public function getAirportCodes(): array
    {
        return $this->airportCodes;
    }

    public function setAirportCodes(array $airportCodes): static
    {
        $this->airportCodes = $airportCodes;

        return $this;
    }

    public function getOpacity(): ?float
    {
        return $this->opacity;
    }

    public function setOpacity(?float $opacity): static
    {
        $this->opacity = $opacity;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(?bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getTimezone(): ?string
    {
        return $this->timezone;
    }

    public function setTimezone(?string $timezone): static
    {
        $this->timezone = $timezone;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(?string $zipcode): static
    {
        $this->zipcode = $zipcode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getThanksImage(): ?string
    {
        return $this->thanksImage;
    }

    public function setThanksImage(?string $thanksImage): static
    {
        $this->thanksImage = $thanksImage;

        return $this;
    }
}
