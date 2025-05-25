<?php

namespace App\Service;

use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\MailerInterface;

class ClientGetter
{
    public function __construct(private EntityManagerInterface $em) {}

    public function get(): ?Client
    {
        $clients = $this->em->getRepository(Client::class)->findAll();

        if (empty($clients))
            throw new \RuntimeException("Aucun client trouvé en base de données.");

        return $clients[0];
    }
}
