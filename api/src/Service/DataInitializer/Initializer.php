<?php

namespace App\Service\DataInitializer;

use App\Entity\Client;
use App\Entity\Nature;
use App\Entity\Option;
use App\Entity\Contact;
use App\Entity\Origine;
use App\Entity\Qualification;
use App\Service\DataInitializer\Data;
use Doctrine\ORM\EntityManagerInterface;

class Initializer
{
    protected $data;
    protected $manager;

    public function __construct(Data $data, EntityManagerInterface $manager)
    {
        $this->data = $data;
        $this->manager = $manager;
    }

    public function initialize(): void
    {
        $this->initEntity(Client::class, [$this->data->getClient()]);
        $this->initEntity(Nature::class, $this->data->getNatures());
        $this->initEntity(Option::class, $this->data->getOptions());
        $this->initEntity(Contact::class, $this->data->getContacts());
        $this->initEntity(Origine::class, $this->data->getOrigines());
        $this->initEntity(Qualification::class, $this->data->getQualifications());

        $this->manager->flush();
    }

    private function initEntity(string $entityClass, array $items): void
    {
        $repo = $this->manager->getRepository($entityClass);

        if ($repo->count([]) > 0) {
            return;
        }

        foreach ($items as $itemData) {
            $entity = new $entityClass();
            $this->hydrateEntity($entity, $itemData);
            $this->manager->persist($entity);
        }
    }

    private function hydrateEntity(object $entity, array $data): void
    {
        foreach ($data as $key => $value) {
            $method = 'set' . ucfirst($key);
            if (!method_exists($entity, $method)) {
                continue;
            }
    
            if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
                $value = new \DateTimeImmutable($value);
            }
    
            $entity->$method($value);
        }
    }
}