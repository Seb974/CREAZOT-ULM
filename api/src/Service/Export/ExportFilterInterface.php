<?php

namespace App\Service\Export;

use Symfony\Component\HttpFoundation\Request;

interface ExportFilterInterface
{
    public function supports(string $entityClass): bool;
    public function getResults(Request $request): array;
    public function formatExport(array $results, string $format = 'csv'): array;
}
