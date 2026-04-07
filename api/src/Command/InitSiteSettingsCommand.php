<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\SiteSettings;
use App\Repository\SiteSettingsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:init:site-settings',
    description: 'Initialise le singleton SiteSettings avec les valeurs par défaut.',
)]
class InitSiteSettingsCommand extends Command
{
    public function __construct(
        private readonly SiteSettingsRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $existing = $this->repository->findInstance();
        if ($existing !== null) {
            $io->info('SiteSettings déjà initialisé.');
            return Command::SUCCESS;
        }

        $settings = new SiteSettings();
        $settings->setName('C6L');
        $settings->setUrl('https://logic-ciel.com');

        $this->em->persist($settings);
        $this->em->flush();

        $io->success('SiteSettings créé avec succès (name="Logic-Ciel", url="https://logic-ciel.com").');

        return Command::SUCCESS;
    }
}
