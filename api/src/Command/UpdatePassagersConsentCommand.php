<?php

namespace App\Command;

use App\Entity\Passager;
use App\Service\ClientGetter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:update-passagers-consent',
    description: 'Ajoute les infos de consentement aux passagers déjà enregistrés',
)]
class UpdatePassagersConsentCommand extends Command
{
    private EntityManagerInterface $em;
    private ClientGetter $clientGetter;

    public function __construct(EntityManagerInterface $em, ClientGetter $clientGetter)
    {
        parent::__construct();
        $this->em = $em;
        $this->clientGetter = $clientGetter;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $client = $this->clientGetter->get();
        $consentText = $client?->getConsentText() ?? '';

        if (empty($consentText)) {
            $io->error('Le texte de consentement du client est vide. Impossible de mettre à jour.');
            return Command::FAILURE;
        }

        $repo = $this->em->getRepository(Passager::class);
        $passagers = $repo->findAll();

        $count = 0;
        foreach ($passagers as $passager) {
            $updated = false;

            if ($passager->getConsentDatetime() === null) {
                $source = $passager->getDate();

                if ($passager->getConsentDatetime() === null) {
                    if ($source instanceof \DateTimeImmutable) {
                        $consentAt = $source;
                    } elseif ($source instanceof \DateTime) {
                        $consentAt = \DateTimeImmutable::createFromMutable($source);
                    } else {
                        $consentAt = new \DateTimeImmutable();
                    }

                    $passager->setConsentDatetime($consentAt);
                    $updated = true;
                }
            }

            if ($passager->isConsentAccepted() === null) {
                $passager->setConsentAccepted(true);
                $updated = true;
            }

            if (empty($passager->getConsentText())) {
                $passager->setConsentText($consentText);
                $updated = true;
            }

            if ($updated) {
                $count++;
            }
        }

        $this->em->flush();

        $io->success("$count passager(s) mis à jour avec les infos de consentement.");

        return Command::SUCCESS;
    }
}