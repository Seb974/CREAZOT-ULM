<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use App\Entity\ModulePackPrice;
use App\Entity\PricingTier;
use Doctrine\ORM\EntityManagerInterface;

class InvoiceCalculator
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    public function calculateMonthlyAmount(Client $client): float
    {
        $category = $client->getPricingCategory();
        if ($category === null) {
            $client->setMonthlyBasePrice(0.0);
            return 0.0;
        }

        $tier = $this->em->getRepository(PricingTier::class)
            ->createQueryBuilder('t')
            ->where('t.pricingCategory = :category')
            ->andWhere('t.minAeronefs <= :count')
            ->andWhere('(t.maxAeronefs >= :count OR t.maxAeronefs IS NULL)')
            ->setParameter('category', $category)
            ->setParameter('count', $client->getMaxAeronefs() ?? 0)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        $basePrice = $tier !== null
            ? $tier->getPricePerAeronef() * ($client->getMaxAeronefs() ?? 0)
            : 0.0;

        $packTotal = 0.0;
        foreach ($client->getModulePacks() as $pack) {
            $packPrice = $this->em->getRepository(ModulePackPrice::class)
                ->createQueryBuilder('mpp')
                ->where('mpp.modulePack = :pack')
                ->andWhere('mpp.pricingCategory = :category')
                ->setParameter('pack', $pack)
                ->setParameter('category', $category)
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();

            if ($packPrice !== null) {
                $packTotal += $packPrice->getMonthlyPrice();
            }
        }

        $total = $basePrice + $packTotal;
        $client->setMonthlyBasePrice($total);

        return $total;
    }

    public function calculateAnnualAmount(Client $client): float
    {
        $monthly = $this->calculateMonthlyAmount($client);
        $discount = $client->getAnnualDiscount() ?? 30.0;

        return $monthly * 12 * (1 - $discount / 100);
    }

    public function calculateInvoiceAmount(Client $client): float
    {
        if ($client->getBillingCycle() === 'annual') {
            return $this->calculateAnnualAmount($client);
        }

        return $this->calculateMonthlyAmount($client);
    }

    public function calculateUpgradeProrata(Client $client, float $previousMonthlyAmount): float
    {
        $newMonthly = $this->calculateMonthlyAmount($client);
        $delta = $newMonthly - $previousMonthlyAmount;

        if ($delta <= 0) {
            return 0.0;
        }

        $lastInvoice = $client->getLastInvoiceDate();
        if ($lastInvoice === null) {
            $monthsRemaining = 12;
        } else {
            $now = new \DateTimeImmutable();
            $monthsElapsed = (int) $now->diff($lastInvoice)->format('%m')
                + ((int) $now->diff($lastInvoice)->format('%y') * 12);
            $monthsRemaining = max(0, 12 - $monthsElapsed);
        }

        $discount = $client->getAnnualDiscount() ?? 30.0;

        return $delta * $monthsRemaining * (1 - $discount / 100);
    }

    /**
     * @return array<int, array{name: string, quantity: int|float, price_unit: float}>
     */
    public function buildInvoiceLines(Client $client): array
    {
        $category = $client->getPricingCategory();
        $lines = [];
        $isAnnual = $client->getBillingCycle() === 'annual';
        $discount = $client->getAnnualDiscount() ?? 30.0;
        $multiplier = $isAnnual ? 12 * (1 - $discount / 100) : 1;
        $suffix = $isAnnual ? sprintf(' (engagement annuel, -%g%%)', $discount) : '';

        $tier = null;
        $pricePerAeronef = 0.0;
        if ($category !== null) {
            $tier = $this->em->getRepository(PricingTier::class)
                ->createQueryBuilder('t')
                ->where('t.pricingCategory = :category')
                ->andWhere('t.minAeronefs <= :count')
                ->andWhere('(t.maxAeronefs >= :count OR t.maxAeronefs IS NULL)')
                ->setParameter('category', $category)
                ->setParameter('count', $client->getMaxAeronefs() ?? 0)
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();
        }

        if ($tier !== null) {
            $pricePerAeronef = $tier->getPricePerAeronef();
        }

        $aeronefs = $client->getMaxAeronefs() ?? 0;
        $lines[] = [
            'name' => sprintf(
                "Forfait Logic'Ciel — %d aéronefs × %s€%s",
                $aeronefs,
                number_format($pricePerAeronef, 2, ',', ' '),
                $suffix,
            ),
            'quantity' => $isAnnual ? 12 : 1,
            'price_unit' => round($pricePerAeronef * $aeronefs * ($isAnnual ? (1 - $discount / 100) : 1), 2),
        ];

        foreach ($client->getModulePacks() as $pack) {
            $packPrice = null;
            if ($category !== null) {
                $packPrice = $this->em->getRepository(ModulePackPrice::class)
                    ->createQueryBuilder('mpp')
                    ->where('mpp.modulePack = :pack')
                    ->andWhere('mpp.pricingCategory = :category')
                    ->setParameter('pack', $pack)
                    ->setParameter('category', $category)
                    ->setMaxResults(1)
                    ->getQuery()
                    ->getOneOrNullResult();
            }

            $unitPrice = $packPrice !== null ? $packPrice->getMonthlyPrice() : 0.0;

            $lines[] = [
                'name' => sprintf('Module: %s%s', $pack->getName(), $suffix),
                'quantity' => $isAnnual ? 12 : 1,
                'price_unit' => round($unitPrice * ($isAnnual ? (1 - $discount / 100) : 1), 2),
            ];
        }

        return $lines;
    }
}
