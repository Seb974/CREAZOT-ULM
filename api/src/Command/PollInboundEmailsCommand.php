<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Client;
use App\Service\EmailChannelService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:poll-inbound-emails',
    description: 'Interroge les boîtes mail des clubs pour traiter les demandes de réservation par IA',
)]
class PollInboundEmailsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private EmailChannelService $emailService,
        private LoggerInterface $logger,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('📬 Poll Inbound Emails — AI Reservation Assistant');

        $clients = $this->em->createQueryBuilder()
            ->select('c')
            ->from(Client::class, 'c')
            ->andWhere('c.aiReservationImapDsn IS NOT NULL')
            ->andWhere("c.aiReservationImapDsn != ''")
            ->getQuery()
            ->getResult();

        if (empty($clients)) {
            $io->info('Aucun client avec une boîte mail AI configurée.');
            return Command::SUCCESS;
        }

        $totalProcessed = 0;
        $clientsPolled = 0;

        foreach ($clients as $client) {
            $io->section("📮 {$client->getName()}");

            try {
                $count = $this->emailService->pollInbox($client);
                $totalProcessed += $count;
                $clientsPolled++;

                if ($count > 0) {
                    $io->success("{$count} email(s) traité(s).");
                } else {
                    $io->info('Aucun nouvel email.');
                }
            } catch (\Throwable $e) {
                $io->error("Erreur : {$e->getMessage()}");
                $this->logger->error('Poll failed for client {name}: {error}', [
                    'name' => $client->getName(),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $io->newLine();
        $io->success("Terminé — {$clientsPolled} client(s) interrogé(s), {$totalProcessed} email(s) traité(s) au total.");

        return Command::SUCCESS;
    }
}
