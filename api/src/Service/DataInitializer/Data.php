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
        'timezone' => 'Indian/Reunion',
        'address' => '9 allée des champignons',
        'zipcode' => '97450',
        'city' => 'Saint-Louis',
        'website' => 'https://www.planetair974.fr',
        'url' => 'https://admin.planetair974.re',
        'hasReservation' => true,
        'hasPassengerRegistration' => true,
        'hasOptions' => true,
        'hasPartners' => true,
        'hasGifts' => true,
        'thanksTitle' => "FORMULAIRE D'ENREGISTREMENT",
        'hasOriginContact' => true,
        'hasLandingManagement' => true,
        'hasEmailConfirmation' => true,
        'emailAddressSender' => 'contact@planetair974.com',
        'confirmationSubject' => 'Vos souvenirs de l\’île intense vous attendent 📸✨',
        'hasPaymentManagement' => true,
        'hasMicrotrakTag' => true,
        'hasWebshop' => true,
        'seuilMedical' => 90,
        'seuilQualifications' => 90
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

    private $PRODKeycloakIds = [
        [
            'email' => 'adrien@planetair974.com', 
            'sub' => '93f39685-d8a6-4615-ae79-f4e6cada9eaf', 
            'username' => 'adrien'
        ],
        [
            'email' => 'planetair974@icloud.com', 
            'sub' => 'd5c0e121-9f57-4ae9-b6d6-872f1ec4a123', 
            'username' => 'boris'
        ],
        [
            'email' => 'francky@planetair974.com', 
            'sub' => '2b2f1160-be50-4881-a68c-a0a1f7467285', 
            'username' => 'francky'
        ],
        [
            'email' => 'olivier.fromentin@gmail.com', 
            'sub' => '82feb453-88e2-44cd-8608-f7d66b0ec8ab', 
            'username' => 'fromentin'
        ],
        [
            'email' => 'gildas@planetair974.com', 
            'sub' => '995364a6-a712-4253-a2c2-b753f99be0c3', 
            'username' => 'gildas'
        ],
        [
            'email' => 'sebastien.maillot@coding-academy.fr', 
            'sub' => '0e823df8-0975-4740-afda-cb527a12fb33', 
            'username' => 'hans'
        ],
        [
            'email' => 'hugues.williamson@planetair974.com', 
            'sub' => '26908620-8b09-4442-8308-f14f4d460c8b', 
            'username' => 'hugues'
        ],
        [
            'email' => 'jed@planetair974.com', 
            'sub' => '38d156de-945e-47b9-8bb7-ce4a265c2b70', 
            'username' => 'jed'
        ],
        [
            'email' => 'loustau-pierre@outlook.fr', 
            'sub' => '0666df1b-2ce9-4235-8a0e-5c6aa51ec018', 
            'username' => 'loustic'
        ],
        [
            'email' => 'planetair974@gmail.com', 
            'sub' => '03569130-1597-4136-823c-74009272acde', 
            'username' => 'luis'
        ],
        [
            'email' => 'michel@planetair974.com', 
            'sub' => '2671fe39-d3ff-44ad-8f75-56061da62db8', 
            'username' => 'michel'
        ],
        [
            'email' => 'paul@planetair974.com', 
            'sub' => 'b0069860-5c47-4eae-8c0c-897cf0f68641', 
            'username' => 'paul'
        ],
        [
            'email' => 'roulphy@planetair974.com', 
            'sub' => 'd2b8b00d-17d8-4914-9ebd-76b080b12532', 
            'username' => 'roulphy'
        ],
        [
            'email' => 'm_seb@icloud.com', 
            'sub' => 'fbe3108d-25b5-431e-b47a-43c35f1e6ab2', 
            'username' => 'seb'
        ],
        [
            'email' => 'sylvain.gauthier@planetair974.re', 
            'sub' => '50ffb724-d68b-4913-9e69-fb30e0e838c6', 
            'username' => 'sylvain'
        ],
        [
            'email' => 'thymotee@planetair974.com', 
            'sub' => '338faccb-a267-4004-af3c-600e142d8ed1', 
            'username' => 'thymotée'
        ],
    ];

    private $DEVKeycloakIds = [
        [
            'email' => 'boris@planetair974.re', 
            'sub' => 'e9de4f6d-f5c8-422a-902e-841d127fd22d', 
            'username' => 'boris'
        ],
        [
            'email' => 'charles.leclerc@fraispei.re', 
            'sub' => '2aa71fee-ab4c-45c6-b71d-ea3f66f31ea4', 
            'username' => 'charles'
        ],
        [
            'email' => 'roulphy@planetair974.com', 
            'sub' => '43517e2c-6a25-4649-91bb-bc828964b023', 
            'username' => 'roulphy'
        ],
        [
            'email' => 'sebastien.maillot@gmx.fr', 
            'sub' => '5887dcb1-88c8-4268-9682-3c2acd4681b0', 
            'username' => 'seb'
        ],
        [
            'email' => 'chloe@planetair974.com', 
            'sub' => '58a01572-f4c3-4e2e-9622-f9f8e513002e', 
            'username' => 'chloe'
        ],
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

    public function getPRODKeycloakIds()
    {
        return $this->PRODKeycloakIds;
    }

    public function getDEVKeycloakIds()
    {
        return $this->DEVKeycloakIds;
    }
}