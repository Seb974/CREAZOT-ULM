<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\SiteSettingsRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SiteSettingsRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    uriTemplate: '/site-settings{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/site-settings/{id}{._format}',
        ),
        new Post(
            uriTemplate: '/site-settings{._format}',
            security: 'is_granted("ROLE_SUPER_ADMIN")'
        ),
        new Get(
            uriTemplate: '/site-settings/{id}{._format}',
            security: 'is_granted("OIDC_USER")'
        ),
        new Put(
            uriTemplate: '/site-settings/{id}{._format}',
            security: 'is_granted("ROLE_SUPER_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['SiteSettings:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['SiteSettings:write'],
    ],
    collectDenormalizationErrors: true,
    mercure: true
)]
class SiteSettings
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['SiteSettings:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private string $name = 'C6L';

    #[ORM\Column(length: 255)]
    #[Assert\Url]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private string $url = 'https://c6l.creazot.com';

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $logo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $favicon = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $appleTouchIcon = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $zipcode = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $emailParams = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $emailAddressSender = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url]
    #[Groups(groups: ['SiteSettings:read', 'SiteSettings:write'])]
    private ?string $odooUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['SiteSettings:write'])]
    private ?string $odooApiKey = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['SiteSettings:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['SiteSettings:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getLogo(): ?string
    {
        return $this->logo;
    }

    public function setLogo(?string $logo): static
    {
        $this->logo = $logo;

        return $this;
    }

    public function getFavicon(): ?string
    {
        return $this->favicon;
    }

    public function setFavicon(?string $favicon): static
    {
        $this->favicon = $favicon;

        return $this;
    }

    public function getAppleTouchIcon(): ?string
    {
        return $this->appleTouchIcon;
    }

    public function setAppleTouchIcon(?string $appleTouchIcon): static
    {
        $this->appleTouchIcon = $appleTouchIcon;

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

    public function getEmailParams(): ?string
    {
        return $this->emailParams;
    }

    public function setEmailParams(?string $emailParams): static
    {
        $this->emailParams = $emailParams;

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

    public function getOdooUrl(): ?string
    {
        return $this->odooUrl;
    }

    public function setOdooUrl(?string $odooUrl): static
    {
        $this->odooUrl = $odooUrl;

        return $this;
    }

    public function getOdooApiKey(): ?string
    {
        return $this->odooApiKey;
    }

    public function setOdooApiKey(?string $odooApiKey): static
    {
        $this->odooApiKey = $odooApiKey;

        return $this;
    }

    public function getIcaoApiKey(): ?string
    {
        return $this->icaoApiKey;
    }

    public function setIcaoApiKey(?string $icaoApiKey): static
    {
        $this->icaoApiKey = $icaoApiKey;

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
}
