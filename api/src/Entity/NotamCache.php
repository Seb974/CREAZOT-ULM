<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\NotamCacheRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotamCacheRepository::class)]
#[ORM\Table(name: 'notam_cache')]
class NotamCache
{
    #[ORM\Id]
    #[ORM\Column(length: 10)]
    private string $icao;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private \DateTimeInterface $fetchedAt;

    #[ORM\Column(type: Types::JSON)]
    private array $data = [];

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $aiAnalysis = null;

    public function getIcao(): string
    {
        return $this->icao;
    }

    public function setIcao(string $icao): static
    {
        $this->icao = strtoupper(trim($icao));
        return $this;
    }

    public function getFetchedAt(): \DateTimeInterface
    {
        return $this->fetchedAt;
    }

    public function setFetchedAt(\DateTimeInterface $fetchedAt): static
    {
        $this->fetchedAt = $fetchedAt;
        return $this;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    public function getAiAnalysis(): ?array
    {
        return $this->aiAnalysis;
    }

    public function setAiAnalysis(?array $aiAnalysis): static
    {
        $this->aiAnalysis = $aiAnalysis;
        return $this;
    }

    public function isFresh(): bool
    {
        return $this->fetchedAt->format('Y-m-d') === (new \DateTime('today'))->format('Y-m-d');
    }
}
