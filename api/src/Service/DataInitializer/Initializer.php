<?php

namespace App\Service\DataInitializer;

use App\Entity\Nature;
use App\Entity\Option;
use App\Service\DataInitializer\Data;
use Doctrine\ORM\EntityManagerInterface;

class Initializer
{
    protected $data;

    public function __construct(Data $data, EntityManagerInterface $manager)
    {
        $this->data = $data;
        $this->manager = $manager;
    }

    public function loadData()
    {
        $this->loadNatures();
        $this->loadOptions();
    }

    public function loadNatures()
    {
        $natures = $this->data->getNatures();
        for($i = 0; $i < count($natures); $i++)
        {
            $nature = new Nature();
            $nature->setCode($this->getCurrentValue($natures[$i], 'code'))
                   ->setLabel($this->getCurrentValue($natures[$i], 'label'));

            $this->manager->persist($nature);
        }
        $this->manager->flush();
    }

    public function loadOptions()
    {
        $options = $this->data->getOptions();
        for($i = 0; $i < count($options); $i++)
        {
            $option = new Option();
            $option->setNom($this->getCurrentValue($options[$i], 'nom'))
                   ->setPrix($this->getCurrentValue($options[$i], 'prix'));

            $this->manager->persist($option);
        }
        $this->manager->flush();
    }

    private function getCurrentValue($data, $variable)
    {
        return array_key_exists($variable, $data) ? (is_string($data[$variable]) ? trim($data[$variable]) : $data[$variable]) : null;
    }
}