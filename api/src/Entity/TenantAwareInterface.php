<?php

declare(strict_types=1);

namespace App\Entity;

interface TenantAwareInterface
{
    public function getClient(): ?Client;

    public function setClient(?Client $client): static;
}
