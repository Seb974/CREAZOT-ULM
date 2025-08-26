<?php

namespace App\Command;

use App\Entity\Prestation;
use App\Entity\User;
use App\Factory\CarnetVol\CarnetVolFactory;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:update-flight-hours',
    description: 'Recalcule les heures de vol et (re)génère les carnets de vol à partir des prestations.',
)]
class UpdateFlightHoursCommand extends Command
{
    private EntityManagerInterface $em;
    private UserRepository $userRepository;
    private CarnetVolFactory $carnetVolFactory;

    public function __construct(EntityManagerInterface $em, UserRepository $userRepository, CarnetVolFactory $carnetVolFactory)
    {
        parent::__construct();
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->carnetVolFactory = $carnetVolFactory;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $pilotes = $this->userRepository->findAll();
        $countPilotes = 0;
        $countCarnets = 0;

        foreach ($pilotes as $user) {
            $profil = $user->getProfilPilote();
            if (!$profil) {
                continue;
            }

            // On remet à zéro
            $profil->setTotalFlightHours(0);

            // On regénère tout, donc on supprime les anciens carnets
            foreach ($profil->getCarnetVols() as $carnet) {
                $this->em->remove($carnet);
            }

            // On parcourt toutes les prestations liées au pilote
            $prestations = $this->em->getRepository(Prestation::class)->findBy(['pilote' => $user]);
            $total = 0;

            foreach ($prestations as $prestation) {
                $aeronef = $prestation->getAeronef();
                $duree = $prestation->getDuree();

                $decimal = $aeronef->isDecimal() ? $duree : $this->getDecimalTimeFromLocale($duree);
                $total += $decimal;

                $carnets = $this->carnetVolFactory->createFromPrestation($prestation, $user);
                foreach ($carnets as $carnet) {
                    $profil->addCarnetVol($carnet);
                    $this->em->persist($carnet);
                    $countCarnets++;
                }
            }

            $profil->setTotalFlightHours($total);
            $countPilotes++;
        }

        $this->em->flush();

        $output->writeln("<info>✅ Totaux recalculés pour $countPilotes pilotes.</info>");
        $output->writeln("<info>✈️  $countCarnets carnets de vol régénérés.</info>");

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
