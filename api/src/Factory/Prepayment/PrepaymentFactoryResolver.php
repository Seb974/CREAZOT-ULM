<?php

namespace App\Factory\Prepayment;

class PrepaymentFactoryResolver
{
    public function __construct( private WixPrepaymentFactory $wixFactory ) {}      // private ShopifyPrepaymentFactory $shopifyFactory, etc.

    public function resolve(string $shopType): PrepaymentFactoryInterface
    {
        return match ($shopType) {
            'wix' => $this->wixFactory,
            // 'shopify' => $this->shopifyFactory,
            default => throw new \InvalidArgumentException("Shop type non supporté: $shopType"),
        };
    }
}
