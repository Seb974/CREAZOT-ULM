<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\IcaoReferenceRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IcaoReferenceRepository::class)]
#[ORM\Table(name: 'icao_reference')]
class IcaoReference
{
    #[ORM\Id]
    #[ORM\Column(length: 4)]
    private string $icao;

    public function getIcao(): string
    {
        return $this->icao;
    }

    public function setIcao(string $icao): static
    {
        $this->icao = strtoupper(trim($icao));
        return $this;
    }
}
