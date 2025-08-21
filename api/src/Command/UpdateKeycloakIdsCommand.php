<?php

namespace App\Command;

use App\Entity\User;
use App\Service\DataInitializer\Data;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(
    name: 'app:update-keycloak-ids',
    description: 'Update users keycloakId based on environment (prod/dev).'
)]
class UpdateKeycloakIdsCommand extends Command
{
    protected static $defaultName = 'app:update-keycloak-ids';
    private $em;
    private $data;

    public function __construct(EntityManagerInterface $em, Data $data)
    {
        parent::__construct();
        $this->em = $em;
        $this->data = $data;
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Met à jour les keycloakId des users selon l\'env (prod/dev)')
            ->addArgument('env', InputArgument::REQUIRED, 'Env à utiliser (prod ou dev)')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simule la mise à jour sans modifier la base');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $env = strtolower(trim($input->getArgument('env')));
        $dryRun = $input->getOption('dry-run');

        if (!in_array($env, ['prod', 'dev'])) {
            $io->error('L\'argument env doit être "prod" ou "dev".');
            return Command::INVALID;
        }

        $keycloakUsers = $env === 'prod'
            ? $this->data->getPRODKeycloakIds()
            : $this->data->getDEVKeycloakIds();

        $repo = $this->em->getRepository(User::class);
        $allUsers = $repo->findAll();

        $updated = [];

        $emailsKeycloak = array_map(fn($u) => $u['email'], $keycloakUsers);

        foreach ($allUsers as $user) {
            $found = false;
            foreach ($keycloakUsers as $kcUser) {
                if ($user->getEmail() === $kcUser['email']) {
                    $user->setKeycloakId($kcUser['sub']);
                    $updated[] = [
                        'email' => $user->getEmail(),
                        'oldKeycloakId' => $user->getKeycloakId(),
                        'newKeycloakId' => $kcUser['sub'],
                    ];
                    if (!$dryRun) {
                        $this->em->persist($user);
                    }
                    $found = true;
                    break;
                }
            }
        }

        if (!$dryRun) {
            $this->em->flush();
        }

        $io->success(sprintf(
            "Traitement terminé pour l'env %s (%s). %d users mis à jour.",
            $env,
            $dryRun ? 'dry-run' : 'live',
            count($updated),
        ));

        return Command::SUCCESS;
    }
}
