<?php

declare(strict_types=1);

namespace App\Entity;

use App\Dto\ClientInput;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ClientRepository;
use Doctrine\DBAL\Types\Types;
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
    // security: 'is_granted("OIDC_USER")',
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

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $website = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasReservation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasPassengerRegistration = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasOptions = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasPartners = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasGifts = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $thanksTitle = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $thanksMessage = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasOriginContact = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasLandingManagement = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasEmailConfirmation = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write'])]
    private ?string $emailServer = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $confirmationMessage = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $emailAddressSender = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $confirmationSubject = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasPaymentManagement = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $url = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasMicrotrakTag = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasWebshop = null;

    #[Groups(groups: ['Client:read'])]
    public function getEmailParams(): string
    {
        if (!$this->emailServer) {
            return '';
        }

        $hidden = str_repeat('*', 6);
        return "transporter+api://{$hidden}:{$hidden}@default";
    }


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

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    public function getHasPassengerRegistration(): ?bool
    {
        return $this->hasPassengerRegistration;
    }

    public function setHasPassengerRegistration(?bool $hasPassengerRegistration): static
    {
        $this->hasPassengerRegistration = $hasPassengerRegistration;

        return $this;
    }

    public function getHasOptions(): ?bool
    {
        return $this->hasOptions;
    }

    public function setHasOptions(?bool $hasOptions): static
    {
        $this->hasOptions = $hasOptions;

        return $this;
    }

    public function getHasPartners(): ?bool
    {
        return $this->hasPartners;
    }

    public function setHasPartners(?bool $hasPartners): static
    {
        $this->hasPartners = $hasPartners;

        return $this;
    }

    public function getHasGifts(): ?bool
    {
        return $this->hasGifts;
    }

    public function setHasGifts(?bool $hasGifts): static
    {
        $this->hasGifts = $hasGifts;

        return $this;
    }

    public function getThanksTitle(): ?string
    {
        return $this->thanksTitle;
    }

    public function setThanksTitle(?string $thanksTitle): static
    {
        $this->thanksTitle = $thanksTitle;

        return $this;
    }

    public function getThanksMessage(): ?string
    {
        return $this->thanksMessage;
    }

    public function setThanksMessage(?string $thanksMessage): static
    {
        $this->thanksMessage = $thanksMessage;

        return $this;
    }

    public function getHasReservation(): ?bool
    {
        return $this->hasReservation;
    }

    public function setHasReservation(?bool $hasReservation): static
    {
        $this->hasReservation = $hasReservation;

        return $this;
    }

    public function getHasOriginContact(): ?bool
    {
        return $this->hasOriginContact;
    }

    public function setHasOriginContact(?bool $hasOriginContact): static
    {
        $this->hasOriginContact = $hasOriginContact;

        return $this;
    }

    public function getHasLandingManagement(): ?bool
    {
        return $this->hasLandingManagement;
    }

    public function setHasLandingManagement(?bool $hasLandingManagement): static
    {
        $this->hasLandingManagement = $hasLandingManagement;

        return $this;
    }

    public function getHasEmailConfirmation(): ?bool
    {
        return $this->hasEmailConfirmation;
    }

    public function setHasEmailConfirmation(?bool $hasEmailConfirmation): static
    {
        $this->hasEmailConfirmation = $hasEmailConfirmation;

        return $this;
    }

    public function getEmailServer(): ?string
    {
        return $this->emailServer;
    }

    public function setEmailServer(?string $emailServer): static
    {
        $this->emailServer = $emailServer;

        return $this;
    }

    public function getConfirmationMessage(): ?string
    {
        return $this->confirmationMessage;
    }

    public function setConfirmationMessage(?string $confirmationMessage): static
    {
        $this->confirmationMessage = $confirmationMessage;

        return $this;
    }

    public function getEmailAddressSender(): ?string
    {
        return $this->emailAddressSender;
    }

    public function setEmailAddressSender(?string $emailAddressSender): static
    {
        $this->emailAddressSender = $emailAddressSender;

        return $this;
    }

    public function getConfirmationSubject(): ?string
    {
        return $this->confirmationSubject;
    }

    public function setConfirmationSubject(?string $confirmationSubject): static
    {
        $this->confirmationSubject = $confirmationSubject;

        return $this;
    }

    public function getHasPaymentManagement(): ?bool
    {
        return $this->hasPaymentManagement;
    }

    public function setHasPaymentManagement(?bool $hasPaymentManagement): static
    {
        $this->hasPaymentManagement = $hasPaymentManagement;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getHasMicrotrakTag(): ?bool
    {
        return $this->hasMicrotrakTag;
    }

    public function setHasMicrotrakTag(?bool $hasMicrotrakTag): static
    {
        $this->hasMicrotrakTag = $hasMicrotrakTag;

        return $this;
    }

    public function getHasWebshop(): ?bool
    {
        return $this->hasWebshop;
    }

    public function setHasWebshop(?bool $hasWebshop): static
    {
        $this->hasWebshop = $hasWebshop;

        return $this;
    }
}
