<?php

namespace App\Command;

use App\Entity\PilotQualification;
use App\Repository\ProfilPiloteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:migrate-pilot-qualifications')]
class MigratePilotQualificationsCommand extends Command
{
    public function __construct(
        private ProfilPiloteRepository $profilRepo,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $profils = $this->profilRepo->findAll();

        foreach ($profils as $profil) {
            foreach ($profil->getQualifications() as $qualification) {
                $pilotQualif = new PilotQualification();
                $pilotQualif->setProfil($profil);
                $pilotQualif->setQualification($qualification);
                $pilotQualif->setDateObtention(new \DateTimeImmutable('2025-01-01'));
                $pilotQualif->setValidUntil(null);

                $this->em->persist($pilotQualif);
                $output->writeln(sprintf(
                    'Créé PilotQualification pour pilote %s et qualif %s',
                    $profil->getId(),
                    $qualification->getId()
                ));
            }
        }

        $this->em->flush();

        $output->writeln('Migration terminée ✅');
        return Command::SUCCESS;
    }
}
