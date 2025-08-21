<?php

namespace App\Factory\Prepayment;

interface PrepaymentFactoryInterface
{
    public function createPrepaymentFromPayload(array $payload): array;
}
