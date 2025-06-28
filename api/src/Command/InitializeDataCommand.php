<?php

namespace App\Command;

use App\Service\DataInitializer\Initializer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:data:initialize',
    description: 'Populate database with initial data if tables are empty.',
)]
class InitializeDataCommand extends Command
{
    public function __construct(private readonly Initializer $initializer)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        try {
            $this->initializer->initialize();
            $io->success("Les données ont été initialisées avec succès.");
        } catch (\Exception $e) {
            $io->error("Une erreur est survenue. Veuillez réessayer ultérieurement.");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
