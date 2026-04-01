<?php
declare(strict_types=1);
namespace App\EventListener;

use App\Entity\Client;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: KernelEvents::REQUEST, priority: 10)]
class TenantFilterListener
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
    ) {}

    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $clientId = $request->headers->get('X-Client-Id');

        if (!$clientId) {
            $filters = $this->em->getFilters();
            if ($filters->isEnabled('client_tenant')) {
                $filters->disable('client_tenant');
            }
            return;
        }

        $client = $this->em->getRepository(Client::class)->find((int) $clientId);
        if (!$client) {
            return;
        }

        $filter = $this->em->getFilters()->enable('client_tenant');
        $filter->setParameter('clientId', $client->getId());
    }
}
