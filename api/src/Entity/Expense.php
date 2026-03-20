<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ExpenseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
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

#[ORM\Entity(repositoryClass: ExpenseRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.expense.date',
                'app.filter.expense.mode',
                'app.filter.expense.intitule',
                'app.filter.expense.maintenance',
                'app.filter.expense.entretien'
            ],
        ),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Expense:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Expense:write'],
    ],
    order: ['date' => 'DESC', 'id' => 'ASC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Expense implements TenantAwareInterface
{
    use TenantAwareTrait;
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?string $beneficiaire = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?string $libelle = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?MediaObject $document = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?bool $relatedToMaintenance = null;

    #[ORM\ManyToOne(inversedBy: 'expenses')]
    #[Groups(groups: ['Expense:write'])]
    private ?Entretien $entretien = null;

    /**
     * @var Collection<int, PaymentDetail>
     */
    #[ORM\OneToMany(targetEntity: PaymentDetail::class, mappedBy: 'expense', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private Collection $details;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?float $tva = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?float $totalHT = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    private ?float $totalTTC = null;

    #[Groups(groups: ['Expense:write', 'Expense:read', 'Entretien:read'])]
    public function getName(): ?string
    {
        $beneficiaire = $this->beneficiaire ?? '';
        $libelle = $this->libelle ?? '';
        $totalTTC = array_reduce($this->details->toArray(), function (float $carry, PaymentDetail $detail): float {
            return $carry + ($detail->getAmount() ?? 0); 
        }, 0.0);

        return trim($beneficiaire . ' - ' . $libelle . ' : ' . $totalTTC . ' €');
    }

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

    public function getBeneficiaire(): ?string
    {
        return $this->beneficiaire;
    }

    public function setBeneficiaire(?string $beneficiaire): static
    {
        $this->beneficiaire = $beneficiaire;

        return $this;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(?string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function getDocument(): ?MediaObject
    {
        return $this->document;
    }

    public function setDocument(?MediaObject $document): static
    {
        $this->document = $document;

        return $this;
    }

    public function isRelatedToMaintenance(): ?bool
    {
        return $this->relatedToMaintenance;
    }

    public function setRelatedToMaintenance(?bool $relatedToMaintenance): static
    {
        $this->relatedToMaintenance = $relatedToMaintenance;

        return $this;
    }

    public function getEntretien(): ?Entretien
    {
        return $this->entretien;
    }

    public function setEntretien(?Entretien $entretien): static
    {
        $this->entretien = $entretien;

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
            $detail->setExpense($this);
        }

        return $this;
    }

    public function removeDetail(PaymentDetail $detail): static
    {
        if ($this->details->removeElement($detail)) {
            // set the owning side to null (unless already changed)
            if ($detail->getExpense() === $this) {
                $detail->setExpense(null);
            }
        }

        return $this;
    }

    public function getTva(): ?float
    {
        return $this->tva;
    }

    public function setTva(?float $tva): static
    {
        $this->tva = $tva;

        return $this;
    }

    public function getTotalHT(): ?float
    {
        return $this->totalHT;
    }

    public function setTotalHT(?float $totalHT): static
    {
        $this->totalHT = $totalHT;

        return $this;
    }

    public function getTotalTTC(): ?float
    {
        return $this->totalTTC;
    }

    public function setTotalTTC(?float $totalTTC): static
    {
        $this->totalTTC = $totalTTC;

        return $this;
    }
}
