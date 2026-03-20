<?php
declare(strict_types=1);
namespace App\Service;

use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ClientGetter
{
    public function __construct(
        private EntityManagerInterface $em,
        private RequestStack $requestStack,
    ) {}

    public function get(): ?Client
    {
        $request = $this->requestStack->getCurrentRequest();
        $clientId = $request?->headers->get('X-Client-Id');
        if ($clientId) {
            $client = $this->em->getRepository(Client::class)->find((int) $clientId);
            if ($client) {
                return $client;
            }
        }
        $clients = $this->em->getRepository(Client::class)->findBy([], ['id' => 'ASC'], 1);
        return $clients[0] ?? null;
    }
}
