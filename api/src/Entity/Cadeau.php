<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CadeauRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

#[ORM\Entity(repositoryClass: CadeauRepository::class)]
#[ApiResource(
    uriTemplate: '/cadeaux{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/cadeaux/{id}{._format}',
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.cadeau.fin',
                'app.filter.cadeau.used',
                'app.filter.cadeau.beneficiaire',
                'app.filter.cadeau.offreur',
                'app.filter.cadeau.valid'
            ],
        ),
        new Post(
            itemUriTemplate: '/cadeaux/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/cadeaux/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/cadeaux/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/cadeaux/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Cadeau:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Cadeau:write'],
    ],
    collectDenormalizationErrors: true,
    order: ['fin' => 'DESC'],
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Cadeau
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $beneficiaire = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $offreur = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?\DateTimeInterface $fin = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $paymentId = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?bool $used = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?Circuit $circuit = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?Option $option = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?float $cout = null;

    /**
     * @var Collection<int, Origine>
     */
    #[ORM\ManyToMany(targetEntity: Origine::class)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private Collection $origine;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $email = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?string $message = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    private ?bool $sendEmail = null;

    public function __construct()
    {
        $this->origine = new ArrayCollection();
    }

    #[Groups(groups: ['Cadeau:write', 'Cadeau:read', 'Reservation:read'])]
    public function getName(): ?string
    {
        return !is_null($this->code) && !is_null($this->beneficiaire) ? $this->code . " - " . $this->beneficiaire : "";
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

    public function getBeneficiaire(): ?string
    {
        return $this->beneficiaire;
    }

    public function setBeneficiaire(?string $beneficiaire): static
    {
        $this->beneficiaire = $beneficiaire;

        return $this;
    }

    public function getOffreur(): ?string
    {
        return $this->offreur;
    }

    public function setOffreur(?string $offreur): static
    {
        $this->offreur = $offreur;

        return $this;
    }

    public function getFin(): ?\DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(?\DateTimeInterface $fin): static
    {
        $this->fin = $fin;

        return $this;
    }

    public function getPaymentId(): ?string
    {
        return $this->paymentId;
    }

    public function setPaymentId(?string $paymentId): static
    {
        $this->paymentId = $paymentId;

        return $this;
    }

    public function isUsed(): ?bool
    {
        return $this->used;
    }

    public function setUsed(?bool $used): static
    {
        $this->used = $used;

        return $this;
    }

    public function getCircuit(): ?Circuit
    {
        return $this->circuit;
    }

    public function setCircuit(?Circuit $circuit): static
    {
        $this->circuit = $circuit;

        return $this;
    }

    public function getOption(): ?Option
    {
        return $this->option;
    }

    public function setOption(?Option $option): static
    {
        $this->option = $option;

        return $this;
    }

    public function getCout(): ?float
    {
        return $this->cout;
    }

    public function setCout(?float $cout): static
    {
        $this->cout = $cout;

        return $this;
    }

    /**
     * @return Collection<int, Origine>
     */
    public function getOrigine(): Collection
    {
        return $this->origine;
    }

    public function addOrigine(Origine $origine): static
    {
        if (!$this->origine->contains($origine)) {
            $this->origine->add($origine);
        }

        return $this;
    }

    public function removeOrigine(Origine $origine): static
    {
        $this->origine->removeElement($origine);

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

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function isSendEmail(): ?bool
    {
        return $this->sendEmail;
    }

    public function setSendEmail(?bool $sendEmail): static
    {
        $this->sendEmail = $sendEmail;

        return $this;
    }
}
