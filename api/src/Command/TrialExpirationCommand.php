<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:trial:expire',
    description: 'Suspend les comptes en période d\'essai expirée',
)]
class TrialExpirationCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $expiredClients = $this->em->createQuery(
            'SELECT c FROM App\Entity\Client c
             WHERE c.subscriptionStatus = :status
               AND c.trialEndsAt < :now'
        )
            ->setParameter('status', 'trial')
            ->setParameter('now', new \DateTimeImmutable())
            ->getResult();

        $count = 0;
        foreach ($expiredClients as $client) {
            $client->setSubscriptionStatus('suspended');
            $this->em->persist($client);
            $count++;
        }

        $this->em->flush();

        $io->success("$count client(s) suspendu(s).");

        return Command::SUCCESS;
    }
}
