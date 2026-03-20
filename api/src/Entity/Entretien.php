<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\EntretienRepository;
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
use App\Entity\TenantAwareInterface;
use App\Entity\TenantAwareTrait;

#[ORM\Entity(repositoryClass: EntretienRepository::class)]
#[ApiResource(
    uriTemplate: '/entretiens{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/entretiens/{id}{._format}',
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.entretien.aeronef',
                'app.filter.entretien.moteur'
            ],
        ),
        new Post(
            itemUriTemplate: '/entretiens/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/entretiens/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/entretiens/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/entretiens/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Entretien:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Entretien:write'],
    ],
    collectDenormalizationErrors: true,
    order: ['date' => 'DESC'],
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Entretien implements TenantAwareInterface
{
    use TenantAwareTrait;
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?Aeronef $aeronef = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?string $intervention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?float $horametreIntervention = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?float $horametreNextIntervention = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private Collection $intervenants;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private ?bool $changementMoteur = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Entretien:read'])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Entretien:read'])]
    private ?User $updatedBy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Entretien:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, MediaObject>
     */
    #[ORM\OneToMany(targetEntity: MediaObject::class, mappedBy: 'entretien')]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private Collection $documents;

    /**
     * @var Collection<int, Expense>
     */
    #[ORM\OneToMany(targetEntity: Expense::class, mappedBy: 'entretien')]
    #[Groups(groups: ['Entretien:write', 'Entretien:read'])]
    private Collection $expenses;

    public function __construct()
    {
        $this->intervenants = new ArrayCollection();
        $this->documents = new ArrayCollection();
        $this->expenses = new ArrayCollection();
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

    public function getAeronef(): ?Aeronef
    {
        return $this->aeronef;
    }

    public function setAeronef(?Aeronef $aeronef): static
    {
        $this->aeronef = $aeronef;

        return $this;
    }

    public function getIntervention(): ?string
    {
        return $this->intervention;
    }

    public function setIntervention(?string $intervention): static
    {
        $this->intervention = $intervention;

        return $this;
    }

    public function getHorametreIntervention(): ?float
    {
        return $this->horametreIntervention;
    }

    public function setHorametreIntervention(?float $horametreIntervention): static
    {
        $this->horametreIntervention = $horametreIntervention;

        return $this;
    }

    public function getHorametreNextIntervention(): ?float
    {
        return $this->horametreNextIntervention;
    }

    public function setHorametreNextIntervention(?float $horametreNextIntervention): static
    {
        $this->horametreNextIntervention = $horametreNextIntervention;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getIntervenants(): Collection
    {
        return $this->intervenants;
    }

    public function addIntervenant(User $intervenant): static
    {
        if (!$this->intervenants->contains($intervenant)) {
            $this->intervenants->add($intervenant);
        }

        return $this;
    }

    public function removeIntervenant(User $intervenant): static
    {
        $this->intervenants->removeElement($intervenant);

        return $this;
    }

    public function isChangementMoteur(): ?bool
    {
        return $this->changementMoteur;
    }

    public function setChangementMoteur(?bool $changementMoteur): static
    {
        $this->changementMoteur = $changementMoteur;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    public function setUpdatedBy(?User $updatedBy): static
    {
        $this->updatedBy = $updatedBy;

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
            $document->setEntretien($this);
        }

        return $this;
    }

    public function removeDocument(MediaObject $document): static
    {
        if ($this->documents->removeElement($document)) {
            // set the owning side to null (unless already changed)
            if ($document->getEntretien() === $this) {
                $document->setEntretien(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Expense>
     */
    public function getExpenses(): Collection
    {
        return $this->expenses;
    }

    public function addExpense(Expense $expense): static
    {
        if (!$this->expenses->contains($expense)) {
            $this->expenses->add($expense);
            $expense->setEntretien($this);
        }

        return $this;
    }

    public function removeExpense(Expense $expense): static
    {
        if ($this->expenses->removeElement($expense)) {
            // set the owning side to null (unless already changed)
            if ($expense->getEntretien() === $this) {
                $expense->setEntretien(null);
            }
        }

        return $this;
    }
}
