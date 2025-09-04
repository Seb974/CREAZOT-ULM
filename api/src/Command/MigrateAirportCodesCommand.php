<?php

namespace App\Command;

use App\Entity\Airport;
use App\Service\ClientGetter;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:migrate-airport-codes')]
class MigrateAirportCodesCommand extends Command
{
    protected static $defaultDescription = 'Crée les entités Airport à partir de airportCodes existants pour chaque client';

    public function __construct(private readonly ClientGetter $clientGetter, private readonly EntityManagerInterface $em) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $client = $this->clientGetter->get();

        if (\is_null($client)) {
            $output->writeln('<error>Aucun client trouvé.</error>');
            return Command::FAILURE;
        }

        $codes = $client->getAirportCodes();
        if (!is_array($codes) || count($codes) === 0) {
            $output->writeln('<comment>Aucun airportCode trouvé pour ce client.</comment>');
            return Command::SUCCESS;
        }

        foreach ($codes as $i => $code) {
            $airport = new Airport();
            $airport->setClient($client);
            $airport->setCode($code['code'] ?? '');
            $airport->setName($code['name'] ?? '');
            $airport->setMain($code['main'] ?? false);
            $airport->setMeteo($code['meteo'] ?? true);

            $this->em->persist($airport);

            $output->writeln(sprintf('  -> Created Airport: %s (%s)', $code['code'] ?? '', $code['name'] ?? ''));
        }

        $this->em->flush();

        $output->writeln('Migration completed successfully.');

        return Command::SUCCESS;
    }
}
