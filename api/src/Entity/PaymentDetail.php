<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PaymentDetailRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: PaymentDetailRepository::class)]
#[ApiResource(
    uriTemplate: '/payment_details{._format}',
    operations: [
        new GetCollection(
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/payment_details/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/payment_details/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/payment_details/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/payment_details/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['PaymentDetail:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['PaymentDetail:write'],
    ],
    order: ['debut' => 'DESC', 'id' => 'ASC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class PaymentDetail
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['PaymentDetail:write', 'Payment:write', 'PaymentDetail:read', 'Payment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['PaymentDetail:write', 'Payment:write', 'PaymentDetail:read', 'Payment:read'])]
    private ?string $mode = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['PaymentDetail:write', 'Payment:write', 'PaymentDetail:read', 'Payment:read'])]
    private ?float $amount = null;

    #[ORM\ManyToOne(inversedBy: 'details')]
    #[Groups(groups: ['PaymentDetail:read'])]
    private ?Payment $payment = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMode(): ?string
    {
        return $this->mode;
    }

    public function setMode(?string $mode): static
    {
        $this->mode = $mode;

        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(?float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getPayment(): ?Payment
    {
        return $this->payment;
    }

    public function setPayment(?Payment $payment): static
    {
        $this->payment = $payment;

        return $this;
    }
}
