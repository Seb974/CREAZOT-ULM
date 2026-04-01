<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\SiteSettings;
use App\Repository\SiteSettingsRepository;

class SiteSettingsProvider
{
    private ?SiteSettings $cached = null;
    private bool $loaded = false;

    public function __construct(
        private readonly SiteSettingsRepository $repository,
    ) {}

    public function getSettings(): ?SiteSettings
    {
        if (!$this->loaded) {
            $this->cached = $this->repository->findInstance();
            $this->loaded = true;
        }

        return $this->cached;
    }
}
