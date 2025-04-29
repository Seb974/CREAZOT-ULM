<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\PrestationRepository;
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
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\BooleanFilter;

#[ORM\Entity(repositoryClass: PrestationRepository::class)]
#[ApiResource(
    uriTemplate: '/prestations{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/prestations/{id}{._format}',
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.prestation.pilote',
                'app.filter.prestation.aeronef',
                'app.filter.prestation.date'
            ],
        ),
        new Post(
            itemUriTemplate: '/prestations/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/prestations/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/prestations/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/prestations/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Prestation:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Prestation:write'],
    ],
    order: ['date' => 'DESC', 'horametreDepart' => 'DESC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true,
)]
#[ApiFilter(DateFilter::class, properties: ['date'])]
class Prestation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Prestation:write', 'Prestation:read', 'Vol:read'])]
    private ?Aeronef $aeronef = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Prestation:write', 'Prestation:read', 'Vol:read'])]
    private ?User $pilote = null;

    /**
     * @var Collection<int, Vol>
     */
    #[ORM\OneToMany(targetEntity: Vol::class, mappedBy: 'prestation', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private Collection $vols;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read', 'Vol:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?float $duree = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?float $horametreDepart = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?float $horametreFin = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?float $turnover = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Prestation:write', 'Prestation:read'])]
    private ?string $remarques = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Prestation:write', 'Prestation:read', 'Vol:read'])]
    private ?User $encadrant = null;

    public function __construct()
    {
        $this->vols = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPilote(): ?User
    {
        return $this->pilote;
    }

    public function setPilote(?User $pilote): static
    {
        $this->pilote = $pilote;

        return $this;
    }

    /**
     * @return Collection<int, Vol>
     */
    public function getVols(): Collection
    {
        return $this->vols;
    }

    public function addVol(Vol $vol): static
    {
        if (!$this->vols->contains($vol)) {
            $this->vols->add($vol);
            $vol->setPrestation($this);
        }

        return $this;
    }

    public function removeVol(Vol $vol): static
    {
        if ($this->vols->removeElement($vol)) {
            // set the owning side to null (unless already changed)
            if ($vol->getPrestation() === $this) {
                $vol->setPrestation(null);
            }
        }

        return $this;
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

    public function getDuree(): ?float
    {
        return $this->duree;
    }

    public function setDuree(?float $duree): static
    {
        $this->duree = $duree;

        return $this;
    }

    public function getHorametreDepart(): ?float
    {
        return $this->horametreDepart;
    }

    public function setHorametreDepart(?float $horametreDepart): static
    {
        $this->horametreDepart = $horametreDepart;

        return $this;
    }

    public function getHorametreFin(): ?float
    {
        return $this->horametreFin;
    }

    public function setHorametreFin(?float $horametreFin): static
    {
        $this->horametreFin = $horametreFin;

        return $this;
    }

    public function getTurnover(): ?float
    {
        return $this->turnover;
    }

    public function setTurnover(?float $turnover): static
    {
        $this->turnover = $turnover;

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

    public function getEncadrant(): ?User
    {
        return $this->encadrant;
    }

    public function setEncadrant(?User $encadrant): static
    {
        $this->encadrant = $encadrant;

        return $this;
    }
}
