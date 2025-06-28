<?php

namespace App\Service\DataInitializer;

class Data
{
    private $client = [
        'name' => 'Planetair974',
        'email' => 'planetair974@gmail.com',
        'phone' => '+262 692 61 92 04',
        'color' => '#d32f2f',
        'lat' => -21.1351,
        'lng' => 55.5114,
        'zoom' => 9,
        'opacity' => 0.7,
        'active' => true,
        'createdAt' => '2025-06-28T10:00:06+00:00',
        'timezone' => 'Indian/Reunion',
        'address' => '9 allée des champignons',
        'zipcode' => '97450',
        'city' => 'Saint-Louis',
        'website' => 'https://www.planetair974.fr',
        'hasReservation' => true,
        'hasPassengerRegistration' => true,
        'hasOptions' => true,
        'hasPartners' => true,
        'hasGifts' => true,
        'thanksTitle' => "FORMULAIRE D'ENREGISTREMENT",
        'hasOriginContact' => true,
        'hasLandingManagement' => true,
        'hasEmailConfirmation' => true,
        'emailServer' => 'sendgrid+api://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@default',
        'emailAddressSender' => 'contact@planetair974.com',
        'confirmationSubject' => 'Vos souvenirs de l\’île intense vous attendent 📸✨',
        'hasPaymentManagement' => true
    ];

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

    private $contacts = [
        ['name' => 'Téléphone'],
        ['name' => 'Email'],
        ['name' => 'SMS'],
        ['name' => 'WhatsApp'],
        ['name' => 'Physique']
    ];

    private $origines = [
        ['name' => 'Le Routard', 'discount' => 0],
        ['name' => 'Wein', 'discount' => 0],
        ['name' => 'Réceptif', 'discount' => 0],
        ['name' => 'Flyer', 'discount' => 0],
        ['name' => 'Bouche à oreille', 'discount' => 0],
        ['name' => 'Office du Tourisme', 'discount' => 0],
        ['name' => 'Web', 'discount' => 0],
        ['name' => 'Air France', 'discount' => 10],
        ['name' => 'La Saga du Rhum', 'discount' => 10],
        ['name' => 'Autre', 'discount' => 0]
    ];

    private $qualifications = [
        ['nom' => 'Pilote professionnel', 'slug' => 'pro', 'color' => '#fb923c', 'encadrant' => false],
        ['nom' => 'Instructeur', 'slug' => 'instructeur', 'color' => '#f87171', 'encadrant' => true],
        ['nom' => 'Vol photo', 'slug' => 'vol-photo', 'color' => '#2dd4bf', 'encadrant' => false],
        ['nom' => 'Largage parachutiste', 'slug' => 'largage-para', 'color' => '#60a5fa', 'encadrant' => false],
        ['nom' => 'Multiaxes', 'slug' => 'multiaxes', 'color' => '#e879f9', 'encadrant' => false],
        ['nom' => 'Emport Passager', 'slug' => 'emport-passager', 'color' => '#a78bfa', 'encadrant' => false],
        ['nom' => 'Secrétariat', 'slug' => 'secretariat', 'color' => '#4ade80', 'encadrant' => false]
    ];

    public function getClient()
    {
        return $this->client;
    }

    public function getNatures()
    {
        return $this->natures;
    }

    public function getOptions()
    {
        return $this->options;
    }

    public function getContacts()
    {
        return $this->contacts;
    }

    public function getOrigines()
    {
        return $this->origines;
    }

    public function getQualifications()
    {
        return $this->qualifications;
    }
}