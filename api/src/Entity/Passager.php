<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PassagerRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PassagerRepository::class)]
#[ApiResource]
class Passager
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Assert\NotBlank(message: 'Un nom de famille est obligatoire.')]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $nom = null;

    #[Assert\NotBlank(message: 'Un prénom est obligatoire.')]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $prenom = null;

    #[Assert\NotBlank(message: 'Une adresse email est obligatoire.')]
    #[Assert\Email(message: 'L\'adresse email saisie n\'est pas valide.')]
    #[ORM\Column(length: 200, nullable: true)]
    private ?string $email = null;

    #[Assert\NotBlank(message: 'Un N° de télephone est obligatoire.')]
    #[Assert\Regex(pattern: '/^(\+|0)[1-9][0-9 \-\(\)\.]{7,32}$/', message:'Le N° de téléphone saisi n\'est pas valide.')]
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telephone = null;

    #[Assert\NotBlank]
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(?string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(?string $prenom): static
    {
        $this->prenom = $prenom;

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

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

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
}
