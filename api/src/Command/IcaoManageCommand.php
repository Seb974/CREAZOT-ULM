<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\IcaoReference;
use App\Repository\IcaoReferenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:icao',
    description: 'Gestion de la table de reference ICAO (import CSV, ajout, suppression, stats)',
)]
class IcaoManageCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private IcaoReferenceRepository $repo,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('action', InputArgument::REQUIRED, 'Action: import | add | remove | count | check')
            ->addArgument('value', InputArgument::OPTIONAL, 'Code ICAO ou chemin vers le CSV')
            ->addOption('purge', null, InputOption::VALUE_NONE, 'Vider la table avant import');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $action = $input->getArgument('action');
        $value = $input->getArgument('value');

        return match ($action) {
            'import' => $this->import($io, $value, $input->getOption('purge')),
            'add' => $this->add($io, $value),
            'remove' => $this->remove($io, $value),
            'count' => $this->count($io),
            'check' => $this->check($io, $value),
            default => $this->usage($io),
        };
    }

    private function import(SymfonyStyle $io, ?string $csvPath, bool $purge): int
    {
        if (!$csvPath || !file_exists($csvPath)) {
            $io->error("Fichier CSV introuvable : $csvPath");
            return Command::FAILURE;
        }

        if ($purge) {
            $this->em->getConnection()->executeStatement('DELETE FROM icao_reference');
            $io->note('Table videe.');
        }

        $file = file_get_contents($csvPath);
        $lines = explode("\n", $file);
        $header = str_getcsv(array_shift($lines));
        $icaoIdx = array_search('icao_code', $header);
        $typeIdx = array_search('type', $header);

        if ($icaoIdx === false) {
            $io->error("Colonne 'icao_code' introuvable dans le CSV.");
            return Command::FAILURE;
        }

        $added = 0;
        $skipped = 0;
        $batch = 500;

        foreach ($lines as $line) {
            if (empty(trim($line))) continue;
            $row = str_getcsv($line);
            $icao = $row[$icaoIdx] ?? '';
            $type = $typeIdx !== false ? ($row[$typeIdx] ?? '') : '';

            if (!$icao || !preg_match('/^[A-Z]{4}$/', $icao) || $type === 'closed') {
                $skipped++;
                continue;
            }

            if ($this->repo->find($icao)) {
                $skipped++;
                continue;
            }

            $ref = new IcaoReference();
            $ref->setIcao($icao);
            $this->em->persist($ref);
            $added++;

            if ($added % $batch === 0) {
                $this->em->flush();
                $this->em->clear();
            }
        }

        $this->em->flush();
        $io->success("Import termine : $added ajoutes, $skipped ignores.");
        return Command::SUCCESS;
    }

    private function add(SymfonyStyle $io, ?string $icao): int
    {
        if (!$icao || !preg_match('/^[A-Z]{4}$/', strtoupper(trim($icao)))) {
            $io->error("Code ICAO invalide (4 lettres majuscules attendues) : $icao");
            return Command::FAILURE;
        }

        $icao = strtoupper(trim($icao));

        if ($this->repo->find($icao)) {
            $io->warning("$icao existe deja dans la table.");
            return Command::SUCCESS;
        }

        $ref = new IcaoReference();
        $ref->setIcao($icao);
        $this->em->persist($ref);
        $this->em->flush();

        $io->success("$icao ajoute a la table de reference.");
        return Command::SUCCESS;
    }

    private function remove(SymfonyStyle $io, ?string $icao): int
    {
        if (!$icao) {
            $io->error('Code ICAO requis.');
            return Command::FAILURE;
        }

        $icao = strtoupper(trim($icao));
        $ref = $this->repo->find($icao);

        if (!$ref) {
            $io->warning("$icao n'existe pas dans la table.");
            return Command::SUCCESS;
        }

        $this->em->remove($ref);
        $this->em->flush();

        $io->success("$icao supprime de la table de reference.");
        return Command::SUCCESS;
    }

    private function count(SymfonyStyle $io): int
    {
        $total = $this->repo->count([]);
        $io->info("Codes ICAO en base : $total");
        return Command::SUCCESS;
    }

    private function check(SymfonyStyle $io, ?string $icao): int
    {
        if (!$icao) {
            $io->error('Code ICAO requis.');
            return Command::FAILURE;
        }

        $icao = strtoupper(trim($icao));
        $exists = $this->repo->isValid($icao);

        $io->info($exists
            ? "$icao : code ICAO reconnu (NOTAMs disponibles)"
            : "$icao : code NON reconnu (pas d'appel NOTAMIFY)"
        );
        return Command::SUCCESS;
    }

    private function usage(SymfonyStyle $io): int
    {
        $io->title('Utilisation');
        $io->listing([
            'app:icao import /chemin/fichier.csv [--purge]',
            'app:icao add FMEE',
            'app:icao remove FMEE',
            'app:icao check FMEE',
            'app:icao check LF9742',
            'app:icao count',
        ]);
        return Command::SUCCESS;
    }
}
