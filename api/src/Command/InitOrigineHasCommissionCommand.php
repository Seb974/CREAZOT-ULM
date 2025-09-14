<?php

namespace App\Command;

use App\Entity\Origine;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:origine:init-has-commission',
    description: 'Met toutes les Origine.hasCommission à false par défaut',
)]
class InitOrigineHasCommissionCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $origineRepo = $this->em->getRepository(Origine::class);
        $origines = $origineRepo->findAll();

        $count = 0;
        foreach ($origines as $origine) {
            if ($origine->getHasCommission() === null) {
                $origine->setHasCommission(false);
                $count++;
            }
        }

        if ($count > 0) {
            $this->em->flush();
        }

        $output->writeln(sprintf('%d origines mises à jour avec hasCommission = false.', $count));

        return Command::SUCCESS;
    }
}
