<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use App\Entity\PricingCategory;
use App\Entity\PricingTier;
use App\Entity\ModulePackPrice;
use Doctrine\ORM\EntityManagerInterface;

class PricingCalculatorService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function calculateMonthlyTotal(Client $client): array
    {
        $category = $client->getPricingCategory();
        if (!$category) {
            return [
                'pricingCategory' => null,
                'aeronefsTotal' => 0,
                'aeronefsActive' => 0,
                'aeronefsMaintenance' => 0,
                'tier' => null,
                'aeronefsSubtotal' => 0.0,
                'maintenanceDiscount' => 0.0,
                'modulePacks' => [],
                'modulePacksSubtotal' => 0.0,
                'total' => 0.0,
            ];
        }

        $aeronefCounts = $this->em->createQuery(
            'SELECT COUNT(a.id) as total,
                    SUM(CASE WHEN a.isAvailable = true THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN a.isAvailable = false THEN 1 ELSE 0 END) as maintenance
             FROM App\Entity\Aeronef a
             WHERE a.client = :client'
        )->setParameter('client', $client)->getSingleResult();

        $totalCount = (int) ($aeronefCounts['total'] ?? 0);
        $activeCount = (int) ($aeronefCounts['active'] ?? 0);
        $maintenanceCount = (int) ($aeronefCounts['maintenance'] ?? 0);

        $tier = $this->findApplicableTier($category, $totalCount);

        $pricePerAeronef = $tier?->getPricePerAeronef() ?? 0.0;
        $maintenanceDiscountPercent = $category->getMaintenanceDiscount();

        $activeSubtotal = $activeCount * $pricePerAeronef;
        $maintenanceSubtotal = $maintenanceCount * $pricePerAeronef * (1 - $maintenanceDiscountPercent / 100);
        $maintenanceDiscountAmount = $maintenanceCount * $pricePerAeronef * ($maintenanceDiscountPercent / 100);
        $aeronefsSubtotal = $activeSubtotal + $maintenanceSubtotal;

        $packsDetail = [];
        $packsTotal = 0.0;

        foreach ($client->getModulePacks() as $pack) {
            $modulePackPrice = $this->em->getRepository(ModulePackPrice::class)->findOneBy([
                'modulePack' => $pack,
                'pricingCategory' => $category,
            ]);

            $price = $modulePackPrice?->getMonthlyPrice() ?? 0.0;
            $packsDetail[] = ['name' => $pack->getName(), 'price' => $price];
            $packsTotal += $price;
        }

        $grandTotal = $aeronefsSubtotal + $packsTotal;

        $client->setMonthlyBasePrice($pricePerAeronef);

        return [
            'pricingCategory' => $category->getName(),
            'aeronefsTotal' => $totalCount,
            'aeronefsActive' => $activeCount,
            'aeronefsMaintenance' => $maintenanceCount,
            'tier' => $tier ? [
                'min' => $tier->getMinAeronefs(),
                'max' => $tier->getMaxAeronefs(),
                'pricePerAeronef' => $tier->getPricePerAeronef(),
            ] : null,
            'aeronefsSubtotal' => $aeronefsSubtotal,
            'maintenanceDiscount' => $maintenanceDiscountAmount,
            'modulePacks' => $packsDetail,
            'modulePacksSubtotal' => $packsTotal,
            'total' => $grandTotal,
        ];
    }

    public function findApplicableTier(PricingCategory $category, int $aeronefCount): ?PricingTier
    {
        return $this->em->createQuery(
            'SELECT t FROM App\Entity\PricingTier t
             WHERE t.pricingCategory = :category
               AND t.minAeronefs <= :count
               AND (t.maxAeronefs >= :count OR t.maxAeronefs IS NULL)
             ORDER BY t.minAeronefs DESC'
        )
            ->setParameter('category', $category)
            ->setParameter('count', $aeronefCount)
            ->setMaxResults(1)
            ->getOneOrNullResult();
    }

    public function recalculateForClient(Client $client): void
    {
        $this->calculateMonthlyTotal($client);
        $this->em->persist($client);
        $this->em->flush();
    }
}
