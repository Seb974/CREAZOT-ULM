<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProfilPiloteRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ProfilPiloteRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.profile.pilote',
                'app.filter.profile.email',
                'app.filter.profile.eleve',
                'app.filter.profile.professionnel',
                'app.filter.profile.instructeur',
            ],
        ),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Profil_pilote:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Profil_pilote:write'],
    ],
    collectDenormalizationErrors: true,
    paginationEnabled: false,
    security: 'is_granted("OIDC_USER")',
    mercure: true,
)]
class ProfilPilote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist'])]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?User $pilote = null;

    /**
     * @var Collection<int, Qualification>
     */
    #[ORM\ManyToMany(targetEntity: Qualification::class)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private Collection $qualifications;

    /**
     * @var Collection<int, PilotQualification>
     */
    #[ORM\OneToMany(targetEntity: PilotQualification::class, mappedBy: 'profil', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private Collection $pilotQualifications;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?\DateTimeImmutable $birthDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Profil_pilote:write', 'Profil_pilote:read'])]
    private ?float $totalFlightHours = null;

    public function __construct()
    {
        $this->qualifications = new ArrayCollection();
        $this->pilotQualifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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
     * @return Collection<int, Qualification>
     */
    public function getQualifications(): Collection
    {
        return $this->qualifications;
    }

    public function addQualification(Qualification $qualification): static
    {
        if (!$this->qualifications->contains($qualification)) {
            $this->qualifications->add($qualification);
        }

        return $this;
    }

    public function removeQualification(Qualification $qualification): static
    {
        $this->qualifications->removeElement($qualification);

        return $this;
    }

    /**
     * @return Collection<int, PilotQualification>
     */
    public function getPilotQualifications(): Collection
    {
        return $this->pilotQualifications;
    }

    public function addPilotQualification(PilotQualification $pilotQualification): static
    {
        if (!$this->pilotQualifications->contains($pilotQualification)) {
            $this->pilotQualifications->add($pilotQualification);
            $pilotQualification->setProfil($this);
        }

        return $this;
    }

    public function removePilotQualification(PilotQualification $pilotQualification): static
    {
        if ($this->pilotQualifications->removeElement($pilotQualification)) {
            // set the owning side to null (unless already changed)
            if ($pilotQualification->getProfil() === $this) {
                $pilotQualification->setProfil(null);
            }
        }

        return $this;
    }

    public function getBirthDate(): ?\DateTimeImmutable
    {
        return $this->birthDate;
    }

    public function setBirthDate(?\DateTimeImmutable $birthDate): static
    {
        $this->birthDate = $birthDate;

        return $this;
    }

    public function getTotalFlightHours(): ?float
    {
        return $this->totalFlightHours;
    }

    public function setTotalFlightHours(?float $totalFlightHours): static
    {
        $this->totalFlightHours = $totalFlightHours;

        return $this;
    }
}
