<?php
declare(strict_types=1);
namespace App\Doctrine\Orm\Filter;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;
use App\Entity\TenantAwareInterface;

class ClientTenantFilter extends SQLFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, string $targetTableAlias): string
    {
        if (!$targetEntity->getReflectionClass()->implementsInterface(TenantAwareInterface::class)) {
            return '';
        }
        try {
            $clientId = $this->getParameter('clientId');
        } catch (\InvalidArgumentException) {
            return '';
        }
        return sprintf('%s.client_id = %s', $targetTableAlias, $clientId);
    }
}
