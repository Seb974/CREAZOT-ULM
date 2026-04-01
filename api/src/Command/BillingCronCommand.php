<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Client;
use App\Service\InvoiceCalculator;
use App\Service\OdooJsonRpcService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:billing:cron',
    description: 'Processus quotidien de facturation : génère les factures, vérifie les trials expirés, suspend les impayés.',
)]
class BillingCronCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly InvoiceCalculator $calculator,
        private readonly OdooJsonRpcService $odoo,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('<info>[Billing CRON] Démarrage…</info>');

        $this->processExpiredTrials($output);
        $this->generateDueInvoices($output);
        $this->checkOverdueAndSuspend($output);

        $output->writeln('<info>[Billing CRON] Terminé.</info>');

        return Command::SUCCESS;
    }

    private function processExpiredTrials(OutputInterface $output): void
    {
        $now = new \DateTimeImmutable();

        $clients = $this->em->getRepository(Client::class)
            ->createQueryBuilder('c')
            ->where('c.subscriptionStatus = :status')
            ->andWhere('c.trialEndsAt < :now')
            ->setParameter('status', 'trial')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        foreach ($clients as $client) {
            try {
                $client->setSubscriptionStatus('suspended');
                $this->em->flush();

                $msg = sprintf('Client %s — trial expiré, suspendu', $client->getName());
                $output->writeln("  <comment>$msg</comment>");
                $this->logger->info($msg);
            } catch (\Throwable $e) {
                $msg = sprintf('Erreur trial %s : %s', $client->getName(), $e->getMessage());
                $output->writeln("  <error>$msg</error>");
                $this->logger->error($msg);
            }
        }
    }

    private function generateDueInvoices(OutputInterface $output): void
    {
        $now = new \DateTimeImmutable();

        $clients = $this->em->getRepository(Client::class)
            ->createQueryBuilder('c')
            ->where('c.subscriptionStatus = :status')
            ->andWhere('c.nextBillingDate <= :now')
            ->andWhere('c.nextBillingDate IS NOT NULL')
            ->setParameter('status', 'active')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        foreach ($clients as $client) {
            try {
                $odooId = $client->getOdooCustomerId();
                if ($odooId === null || $odooId === '') {
                    $msg = sprintf('Client %s — pas de odooCustomerId, facture ignorée', $client->getName());
                    $output->writeln("  <comment>$msg</comment>");
                    $this->logger->warning($msg);
                    continue;
                }

                $amount = $this->calculator->calculateInvoiceAmount($client);
                $lines = $this->calculator->buildInvoiceLines($client);

                $invoiceId = $this->odoo->createInvoice(
                    (int) $odooId,
                    $lines,
                    2,
                    sprintf("Logic'Ciel — %s", $client->getName()),
                );

                $this->odoo->validateInvoice($invoiceId);
                $this->odoo->sendInvoiceByEmail($invoiceId);

                $client->setLastInvoiceDate(new \DateTimeImmutable());
                $client->setOdooLastInvoiceId($invoiceId);

                $interval = $client->getBillingCycle() === 'annual'
                    ? new \DateInterval('P365D')
                    : new \DateInterval('P30D');
                $client->setNextBillingDate($client->getNextBillingDate()->add($interval));

                $this->em->flush();

                $msg = sprintf(
                    'Client %s — facture #%d créée (%.2f€)',
                    $client->getName(),
                    $invoiceId,
                    $amount,
                );
                $output->writeln("  <info>$msg</info>");
                $this->logger->info($msg);
            } catch (\Throwable $e) {
                $msg = sprintf('Erreur facturation %s : %s', $client->getName(), $e->getMessage());
                $output->writeln("  <error>$msg</error>");
                $this->logger->error($msg);
            }
        }
    }

    private function checkOverdueAndSuspend(OutputInterface $output): void
    {
        // --- Suspension des impayés ---
        try {
            $overdueInvoices = $this->odoo->getOverdueInvoices(30);

            foreach ($overdueInvoices as $invoice) {
                try {
                    $partnerId = $invoice['partner_id'] ?? null;
                    if ($partnerId === null) {
                        continue;
                    }

                    if (is_array($partnerId)) {
                        $partnerId = (string) $partnerId[0];
                    } else {
                        $partnerId = (string) $partnerId;
                    }

                    $client = $this->em->getRepository(Client::class)
                        ->findOneBy(['odooCustomerId' => $partnerId]);

                    if ($client === null || $client->getSubscriptionStatus() === 'suspended') {
                        continue;
                    }

                    $client->setSubscriptionStatus('suspended');
                    $this->em->flush();

                    $invoiceName = $invoice['name'] ?? $invoice['id'] ?? 'N/A';
                    $msg = sprintf(
                        'Client %s suspendu — facture %s impayée depuis 30+ jours',
                        $client->getName(),
                        $invoiceName,
                    );
                    $output->writeln("  <comment>$msg</comment>");
                    $this->logger->info($msg);
                } catch (\Throwable $e) {
                    $msg = sprintf('Erreur suspension impayé : %s', $e->getMessage());
                    $output->writeln("  <error>$msg</error>");
                    $this->logger->error($msg);
                }
            }
        } catch (\Throwable $e) {
            $msg = sprintf('Erreur récupération factures impayées : %s', $e->getMessage());
            $output->writeln("  <error>$msg</error>");
            $this->logger->error($msg);
        }

        // --- Réactivation des clients ayant payé ---
        try {
            $suspendedClients = $this->em->getRepository(Client::class)
                ->createQueryBuilder('c')
                ->where('c.subscriptionStatus = :status')
                ->andWhere('c.odooLastInvoiceId IS NOT NULL')
                ->setParameter('status', 'suspended')
                ->getQuery()
                ->getResult();

            foreach ($suspendedClients as $client) {
                try {
                    $invoiceData = $this->odoo->getInvoice($client->getOdooLastInvoiceId());
                    $paymentState = $invoiceData['payment_state'] ?? null;

                    if ($paymentState === 'paid' || $paymentState === 'in_payment') {
                        $client->setSubscriptionStatus('active');
                        $this->em->flush();

                        $msg = sprintf('Client %s réactivé — paiement reçu', $client->getName());
                        $output->writeln("  <info>$msg</info>");
                        $this->logger->info($msg);
                    }
                } catch (\Throwable $e) {
                    $msg = sprintf('Erreur vérification paiement %s : %s', $client->getName(), $e->getMessage());
                    $output->writeln("  <error>$msg</error>");
                    $this->logger->error($msg);
                }
            }
        } catch (\Throwable $e) {
            $msg = sprintf('Erreur vérification réactivations : %s', $e->getMessage());
            $output->writeln("  <error>$msg</error>");
            $this->logger->error($msg);
        }
    }
}
