<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Landing;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\VolRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: VolRepository::class)]
#[ApiResource(
    uriTemplate: '/vols{._format}',
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.vol.pilote',
                'app.filter.vol.aeronef',
                'app.filter.vol.date',
                'app.filter.vol.circuit',
                'app.filter.vol.pilote.email'
            ],
        ),
        new Post(),
        new Get(
            uriTemplate: '/vols/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/vols/{id}{._format}',
        ),
        new Patch(
            uriTemplate: '/vols/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/vols/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Vol:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Vol:write'],
    ],
    order: ['prestation.date' => 'DESC'],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Vol
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read', 'Landing:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read', 'Landing:read'])]
    private ?Circuit $circuit = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read', 'Landing:read'])]
    private ?int $quantite = null;

    #[ORM\ManyToOne(inversedBy: 'vols')]
    #[Groups(groups: ['Vol:read', 'Landing:read'])]
    private ?Prestation $prestation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read'])]
    private ?float $duree = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read'])]
    private ?float $prix = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read'])]
    private ?Option $option = null;

    #[ORM\OneToMany(targetEntity: Landing::class, mappedBy: 'vol', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Prestation:read', 'Vol:read'])]
    private Collection $landings;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Vol:write', 'Prestation:write', 'Vol:read', 'Prestation:read'])]
    private ?float $cout = null;

    public function __construct()
    {
        $this->landings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(?int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getPrestation(): ?Prestation
    {
        return $this->prestation;
    }

    public function setPrestation(?Prestation $prestation): static
    {
        $this->prestation = $prestation;

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

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(?float $prix): static
    {
        $this->prix = $prix;

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

    /**
     * @return Collection<int, Landing>
     */
    public function getLandings(): Collection
    {
        return $this->landings;
    }

    public function addLanding(Landing $landing): static
    {
        if (!$this->landings->contains($landing)) {
            $this->landings->add($landing);
            $landing->setVol($this);
        }

        return $this;
    }

    public function removeLanding(Landing $landing): static
    {
        if ($this->landings->removeElement($landing)) {
            // set the owning side to null (unless already changed)
            if ($landing->getVol() === $this) {
                $landing->setVol(null);
            }
        }

        return $this;
    }

    private function getCalculatedCost(): float
    {
        if ($this->circuit->isPrixFixe())
            return $this->circuit->getCout() * $this->quantite;
        else {
            $aeronef = $this->prestation->getAeronef();
            if ($aeronef->isDecimal()) {
                $decimalResult = $this->duree * $this->circuit->getCout() * $this->quantite;
                return $decimalResult;
            } else {
                $duree = floor($this->duree) + ($this->duree - floor($this->duree)) / 60 * 100;
                $localeResult = $duree * $this->circuit->getCout() * $this->quantite;
                return $localeResult;
            }
        }
    }

    public function getCout(): ?float
    {
        return !\is_null($this->cout) ? $this->cout : $this->getCalculatedCost();
    }

    public function setCout(?float $cout): static
    {
        $this->cout = $cout;

        return $this;
    }
}
