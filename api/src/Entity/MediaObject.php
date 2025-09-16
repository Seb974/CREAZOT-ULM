<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\OpenApi\Model;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[Vich\Uploadable]
#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['media_object:read']],
    denormalizationContext: ['groups' => ['media_object:write']],
    types: ['https://schema.org/MediaObject'],
    outputFormats: ['jsonld' => ['application/ld+json']],
    operations: [
        new Get(),
        new GetCollection(),
        new GetCollection(),
        new Patch(),
        new Post(
            inputFormats: ['multipart' => ['multipart/form-data']],
            openapi: new Model\Operation(
                requestBody: new Model\RequestBody(
                    content: new \ArrayObject([
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'file' => [
                                        'type' => 'string',
                                        'format' => 'binary'
                                    ],
                                    'description' => [
                                        'type' => 'string'
                                    ]
                                ]
                            ]
                        ]
                    ])
                )
            )
        )
    ]
)]
class MediaObject
{
    #[ORM\Id, ORM\Column, ORM\GeneratedValue]
    private ?int $id = null;

    #[ApiProperty(types: ['https://schema.org/contentUrl'], writable: false)]
    #[Groups(['media_object:read', 'CertificatMedical:read', 'PilotQualification:read', 'Profil_pilote:read', 'Aeronef:read', 'Airport:read', 'Entretien:read', 'Expense:read'])]
    public ?string $contentUrl = null;

    #[Vich\UploadableField(mapping: 'media_object', fileNameProperty: 'filePath')]
    #[Assert\File(
        maxSize: '200M',
        mimeTypes: [
            'image/jpeg',
            'image/png',
            'application/pdf',
        ],
    mimeTypesMessage: 'Veuillez uploader une image (JPEG, PNG) ou un PDF valide'
)]
    #[Groups(['media_object:write'])]
    public ?File $file = null;

    #[ApiProperty(writable: false)]
    #[ORM\Column(nullable: true)]
    public ?string $filePath = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['media_object:read', 'media_object:write', 'CertificatMedical:read', 'PilotQualification:read', 'Profil_pilote:read', 'Aeronef:read', 'Airport:read', 'Entretien:read', 'Expense:read'])]
    public ?string $description = null;

    #[ORM\Column]
    #[Groups(['media_object:read', 'CertificatMedical:read', 'PilotQualification:read', 'Profil_pilote:read', 'Aeronef:read', 'Airport:read', 'Entretien:read', 'Expense:read'])]
    public ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'documents')]
    #[Groups(['media_object:read'])]
    private ?ProfilPilote $profilPilote = null;

    #[ORM\ManyToOne(inversedBy: 'documents')]
    #[Groups(['media_object:read'])]
    private ?Aeronef $aeronef = null;

    #[ORM\ManyToOne(inversedBy: 'documents')]
    #[Groups(['media_object:read'])]
    private ?Airport $airport = null;

    #[ORM\ManyToOne(inversedBy: 'documents')]
    #[Groups(['media_object:read'])]
    private ?Entretien $entretien = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

     #[Groups(['media_object:read', 'media_object:write', 'CertificatMedical:read', 'PilotQualification:read', 'Profil_pilote:read', 'Aeronef:read', 'Airport:read', 'Entretien:read', 'Expense:read'])]
    public function getOriginalDescription(): ?string
    {
        return $this->description;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getProfilPilote(): ?ProfilPilote
    {
        return $this->profilPilote;
    }

    public function setProfilPilote(?ProfilPilote $profilPilote): static
    {
        $this->profilPilote = $profilPilote;

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

    public function getAirport(): ?Airport
    {
        return $this->airport;
    }

    public function setAirport(?Airport $airport): static
    {
        $this->airport = $airport;

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
}