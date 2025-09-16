<?php

namespace App\Service\Export;

use Symfony\Component\HttpFoundation\Request;

class ExportFilterManager
{
    /** @var ExportFilterInterface[] */
    private array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function getResults(string $entityClass, Request $request): array
    {
        foreach ($this->filters as $filter) {
            if ($filter->supports($entityClass)) {
                return $filter->getResults($request);
            }
        }

        return [];
    }

    public function formatExport(string $entityClass, array $results, string $format = 'csv'): array
    {
        foreach ($this->filters as $filter) {
            if ($filter->supports($entityClass)) {
                return $filter->formatExport($results, $format);
            }
        }

        return [[], []];
    }
}
