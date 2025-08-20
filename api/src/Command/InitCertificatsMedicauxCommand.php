<?php

namespace App\Command;

use App\Entity\CertificatMedical;
use App\Entity\ProfilPilote;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:init-certificats-medicaux',
    description: 'Initialise ou met à jour les certificats médicaux de tous les pilotes',
)]
class InitCertificatsMedicauxCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $profilPilotes = $this->em->getRepository(ProfilPilote::class)->findAll();

        $defaultDate = new \DateTimeImmutable('2025-01-01');

        foreach ($profilPilotes as $profil) {
            /** @var ProfilPilote $profil */
            $certificat = $profil->getCertificatMedical();

            if (!$certificat) {
                $certificat = new CertificatMedical();
                $certificat
                    ->setProfil($profil)
                    ->setCreatedAt(new \DateTimeImmutable());
                $this->em->persist($certificat);
                $io->writeln("Création d'un certificat médical pour le pilote #{$profil->getId()}");
            } else {
                $io->writeln("Mise à jour du certificat médical existant pour le pilote #{$profil->getId()}");
            }

            // Peupler les champs demandés
            $certificat
                ->setType('CNCI')
                ->setDateObtention($defaultDate)
                ->setValidUntil(null)
                ->setValidityDurationMonths(0)
                ->setMedecin('')
                ->setRemarques('')
                ->setUpdatedAt(new \DateTimeImmutable());

            // BirthDate du pilote si vide
            if (!$profil->getBirthDate()) {
                $profil->setBirthDate($defaultDate);
                $io->writeln("→ BirthDate renseignée pour le pilote #{$profil->getId()}");
            }
        }

        $this->em->flush();

        $io->success('Certificats médicaux initialisés/mis à jour pour tous les pilotes.');

        return Command::SUCCESS;
    }
}
