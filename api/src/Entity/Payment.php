<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PaymentRepository;
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

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ApiResource(
    uriTemplate: '/payments{._format}',
    operations: [
        new GetCollection(
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.payment.name',
                'app.filter.payment.date',
                'app.filter.payment.reservation',
                'app.filter.payment.reference',
                'app.filter.payment.label',
                'app.filter.payment.mode',
                'app.filter.payment.intitule'
            ],
        ),
        new Post(
            itemUriTemplate: '/payments/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/payments/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/payments/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/payments/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Payment:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Payment:write'],
    ],
    order: ['id' => 'ASC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?string $reference = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?string $label = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?string $reservationCode = null;

    /**
     * @var Collection<int, PaymentDetail>
     */
    #[ORM\OneToMany(targetEntity: PaymentDetail::class, mappedBy: 'payment', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private Collection $details;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Payment:write', 'Payment:read'])]
    private ?string $remarques = null;

    public function __construct()
    {
        $this->details = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(?\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(?string $reference): static
    {
        $this->reference = $reference;

        return $this;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getReservationCode(): ?string
    {
        return $this->reservationCode;
    }

    public function setReservationCode(?string $reservationCode): static
    {
        $this->reservationCode = $reservationCode;

        return $this;
    }

    /**
     * @return Collection<int, PaymentDetail>
     */
    public function getDetails(): Collection
    {
        return $this->details;
    }

    public function addDetail(PaymentDetail $detail): static
    {
        if (!$this->details->contains($detail)) {
            $this->details->add($detail);
            $detail->setPayment($this);
        }

        return $this;
    }

    public function removeDetail(PaymentDetail $detail): static
    {
        if ($this->details->removeElement($detail)) {
            // set the owning side to null (unless already changed)
            if ($detail->getPayment() === $this) {
                $detail->setPayment(null);
            }
        }

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

    public function getRemarques(): ?string
    {
        return $this->remarques;
    }

    public function setRemarques(?string $remarques): static
    {
        $this->remarques = $remarques;

        return $this;
    }
}
