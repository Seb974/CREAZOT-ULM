<?php

namespace App\Command;

use App\Entity\Prestation;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:update-flight-hours',
    description: 'Recalcule et met à jour le totalFlightHours de chaque pilote à partir des prestations effectuées.',
)]
class UpdateFlightHoursCommand extends Command
{
    private EntityManagerInterface $em;
    private UserRepository $userRepository;

    public function __construct(EntityManagerInterface $em, UserRepository $userRepository)
    {
        parent::__construct();
        $this->em = $em;
        $this->userRepository = $userRepository;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $pilotes = $this->userRepository->findAll();
        $count = 0;

        foreach ($pilotes as $user) {
            $profil = $user->getProfilPilote();
            if (!$profil) {
                continue;
            }

            // On remet à zéro
            $profil->setTotalFlightHours(0);

            // On parcourt toutes les prestations liées au pilote
            $prestations = $this->em->getRepository(Prestation::class)->findBy(['pilote' => $user]);

            $total = 0;
            foreach ($prestations as $prestation) {
                $aeronef = $prestation->getAeronef();
                $duree = $prestation->getDuree();

                if ($aeronef->isDecimal()) {
                    $total += $duree;
                } else {
                    $total += $this->getDecimalTimeFromLocale($duree);
                }
            }

            $profil->setTotalFlightHours($total);
            $count++;
        }

        $this->em->flush();

        $output->writeln("<info>✅ Totaux recalculés pour $count pilotes.</info>");

        return Command::SUCCESS;
    }

    private function getDecimalTimeFromLocale(float $duration): float
    {
        $hours = floor($duration);
        $minutes = ($duration - $hours) * 100;
        $decimal = $hours + ($minutes / 60);
        return round($decimal, 2);
    }
}
