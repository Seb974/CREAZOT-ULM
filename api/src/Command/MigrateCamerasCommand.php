<?php

namespace App\Command;

use App\Entity\Camera;
use App\Service\ClientGetter;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:migrate-cameras')]
class MigrateCamerasCommand extends Command
{
    protected static $defaultDescription = 'Crée les entités Cameras à partir de camIds existants pour le client';

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

        $ids = $client->getCamIds();
        if (!is_array($ids) || count($ids) === 0) {
            $output->writeln('<comment>Aucune caméra trouvée pour ce client.</comment>');
            return Command::SUCCESS;
        }

        foreach ($ids as $i => $id) {
            $camera = new Camera();
            $camera->setClient($client);
            $camera->setCode($id['id'] ?? '');
            $camera->setNom($id['nom'] ?? '');

            $this->em->persist($camera);

            $output->writeln(sprintf('  -> Caméra créée : %s (%s)', $id['id'] ?? '', $id['nom'] ?? ''));
        }

        $this->em->flush();

        $output->writeln('Migration completed successfully.');

        return Command::SUCCESS;
    }
}
