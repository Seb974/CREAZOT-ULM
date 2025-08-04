<?php

namespace App\Service;

use App\Entity\Client;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\MailerInterface;
use App\Service\ClientGetter;

class DynamicMailerFactory
{
    public function __construct(private ClientGetter $clientGetter) {}

    public function getMailerForClient(): ?MailerInterface
    {
        $client = $this->clientGetter->get();
        $dsn = $client->getEmailServer();

        if (!$dsn)
            throw new \RuntimeException("Le client n’a pas de DSN MailJet configuré.");

        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }
}
