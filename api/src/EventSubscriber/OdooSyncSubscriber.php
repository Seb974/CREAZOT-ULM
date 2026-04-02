<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\Client;
use App\Service\InvoiceCalculator;
use App\Service\OdooJsonRpcService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use ApiPlatform\Symfony\EventListener\EventPriorities;

class OdooSyncSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private OdooJsonRpcService $odoo,
        private InvoiceCalculator $calculator,
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::VIEW => ['onClientWrite', EventPriorities::POST_WRITE - 1]];
    }

    public function onClientWrite(ViewEvent $event): void
    {
        $entity = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$entity instanceof Client || !in_array($method, ['POST', 'PUT'], true)) {
            return;
        }

        try {
            $this->syncPartner($entity, $method);

            if ($method === 'PUT') {
                $this->handleUpgradeProrata($entity);
            }
        } catch (\RuntimeException $e) {
            if (str_contains($e->getMessage(), 'SiteSettings introuvable') || str_contains($e->getMessage(), 'Configuration Odoo incomplète')) {
                return;
            }
            $this->logger->error('OdooSyncSubscriber: Odoo sync failed', [
                'client_id' => $entity->getId(),
                'method' => $method,
                'error' => $e->getMessage(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('OdooSyncSubscriber: Odoo sync failed', [
                'client_id' => $entity->getId(),
                'method' => $method,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function syncPartner(Client $entity, string $method): void
    {
        $partnerData = [
            'name' => $entity->getName(),
            'email' => $entity->getEmail(),
            'phone' => $entity->getPhone(),
            'street' => $entity->getAddress(),
            'zip' => $entity->getZipcode(),
            'city' => $entity->getCity(),
            'customer_rank' => 1,
            'is_company' => true,
        ];

        $partnerData = array_filter($partnerData, fn($v) => $v !== null);

        $odooId = $entity->getOdooCustomerId();

        if ($method === 'POST' && empty($odooId)) {
            $partnerId = $this->odoo->createPartner($partnerData);
            $entity->setOdooCustomerId((string) $partnerId);
            $this->em->flush();

            $this->logger->info('OdooSyncSubscriber: Partner created on POST', [
                'client_id' => $entity->getId(),
                'odoo_partner_id' => $partnerId,
            ]);

            return;
        }

        if ($method === 'PUT') {
            if (!empty($odooId)) {
                $this->odoo->updatePartner((int) $odooId, $partnerData);

                $this->logger->info('OdooSyncSubscriber: Partner updated on PUT', [
                    'client_id' => $entity->getId(),
                    'odoo_partner_id' => $odooId,
                ]);
            } else {
                $partnerId = $this->odoo->createPartner($partnerData);
                $entity->setOdooCustomerId((string) $partnerId);
                $this->em->flush();

                $this->logger->info('OdooSyncSubscriber: Partner created on PUT (was missing)', [
                    'client_id' => $entity->getId(),
                    'odoo_partner_id' => $partnerId,
                ]);
            }
        }
    }

    private function handleUpgradeProrata(Client $entity): void
    {
        if ($entity->getSubscriptionStatus() !== 'active' || $entity->getBillingCycle() !== 'annual') {
            return;
        }

        $previousMonthly = $entity->getMonthlyBasePrice() ?? 0.0;
        $newMonthly = $this->calculator->calculateMonthlyAmount($entity);

        if (
            $newMonthly <= $previousMonthly
            || empty($entity->getOdooCustomerId())
            || $entity->getLastInvoiceDate() === null
        ) {
            return;
        }

        $prorata = $this->calculator->calculateUpgradeProrata($entity, $previousMonthly);

        if ($prorata <= 0) {
            return;
        }

        $lines = [
            [
                'name' => 'Complément forfait — Upgrade mid-cycle',
                'quantity' => 1,
                'price_unit' => $prorata,
            ],
        ];

        $invoiceId = $this->odoo->createInvoice(
            (int) $entity->getOdooCustomerId(),
            $lines,
            2,
            sprintf('Upgrade — %s', $entity->getName()),
        );

        $this->odoo->validateInvoice($invoiceId);
        $this->odoo->sendInvoiceByEmail($invoiceId);

        $entity->setOdooLastInvoiceId($invoiceId);
        $this->em->flush();

        $this->logger->info('OdooSyncSubscriber: Upgrade prorata invoice created', [
            'client_id' => $entity->getId(),
            'odoo_invoice_id' => $invoiceId,
            'prorata_amount' => $prorata,
            'previous_monthly' => $previousMonthly,
            'new_monthly' => $newMonthly,
        ]);
    }
}
