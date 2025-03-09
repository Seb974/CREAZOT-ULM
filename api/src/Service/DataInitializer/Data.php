<?php

namespace App\Service\DataInitializer;

class Data
{
    private $natures = [
        ['code' => 'VLO',   'label' => 'Vol Local à titre Onéreux'],
        ['code' => 'VSO',   'label' => 'Vol à Sensation à titre Onéreux'],
        ['code' => 'VEF',   'label' => 'Vol d\'Entraînement ou de Formation'],
        ['code' => 'VAPO',  'label' => 'Vol pour Activité Particulière à titre Onéreux'],
        ['code' => 'AUTRE', 'label' => 'Autre Activité'],
        ['code' => 'N/A',   'label' => 'Non Applicable']
    ];

    private $options = [
        ['nom' => 'Porte Photo', 'prix' => 20],
        ['nom' => 'Prote Photo Offerte', 'prix' => 0]
    ];

    public function getNatures()
    {
        return $this->natures;
    }

    public function getOptions()
    {
        return $this->options;
    }
}