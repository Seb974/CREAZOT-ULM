<?php

// src\Dto\ClientInput.php

namespace App\Dto;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

final class ClientInput
{
    #[Assert\NotBlank]
    #[Groups(['Client:write'])]
    public ?string $name = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $slug = null;

    #[Assert\Email]
    #[Groups(['Client:write'])]
    public ?string $email = null;

    #[Assert\Regex('/^[\d\s\+\-()]+$/', message: 'Numéro de téléphone invalide.')]
    #[Groups(['Client:write'])]
    public ?string $phone = null;

    #[Assert\File(maxSize: '4M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $logo = null;

    #[Assert\File(maxSize: '2M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $favicon = null;

    #[Assert\File(maxSize: '4M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $pdfBackground = null;

    #[Assert\File(maxSize: '8M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $thanksImage = null;

    #[Assert\File(maxSize: '2M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $mapIcon = null;

    #[Assert\Regex('/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(['Client:write'])]
    public ?string $color = null;

    #[Groups(['Client:write'])]
    public ?float $lat = null;

    #[Groups(['Client:write'])]
    public ?float $lng = null;

    #[Groups(['Client:write'])]
    public ?int $zoom = null;

    #[Groups(['Client:write'])]
    public $camIds = null;

    #[Groups(['Client:write'])]
    public $airportCodes = null;

    #[Assert\Range(min: 0, max: 1)]
    #[Groups(['Client:write'])]
    public ?float $opacity = null;

    #[Groups(['Client:write'])]
    public ?bool $active = null;

    #[Groups(['Client:write'])]
    public ?string $timezone = null;

    #[Groups(['Client:write'])]
    public ?string $address = null;

    #[Groups(['Client:write'])]
    public ?string $zipcode = null;

    #[Groups(['Client:write'])]
    public ?string $city = null;

    #[Groups(['Client:write'])]
    public ?string $website = null;

    #[Groups(['Client:write'])]
    public ?bool $hasPassengerRegistration = null;

    #[Groups(['Client:write'])]
    public ?bool $hasOptions = null;

    #[Groups(['Client:write'])]
    public ?bool $hasPartners = null;

    #[Groups(['Client:write'])]
    public ?bool $hasGifts = null;

    #[Groups(['Client:write'])]
    public ?bool $hasOriginContact = null;

    #[Groups(['Client:write'])]
    public ?bool $hasReservation = null;

    #[Groups(['Client:write'])]
    public ?string $thanksTitle = null;

    #[Groups(['Client:write'])]
    public ?string $thanksMessage = null;
}
