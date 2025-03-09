<?php

declare(strict_types=1);

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
    description: 'Populate database with initial options and natures.',
)]
class DataInitializeCommand extends Command
{
    protected $initializer;

    public function __construct(Initializer $initializer)
    {
        parent::__construct();
        $this->initializer = $initializer;
    }

    protected function configure(): void {}

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        try {
            $this->initializer->loadData();
            $io->success("Les données ont bien été importées.");
        } catch (\Exception $e) {
            $io->error("Une erreur est survenue. Veuillez réessayer ultérieurement.");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
