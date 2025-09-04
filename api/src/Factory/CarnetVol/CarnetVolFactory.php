<?php

namespace App\Factory\CarnetVol;

use App\Entity\Vol;
use App\Entity\User;
use App\Entity\Client;
use App\Entity\Aeronef;
use App\Entity\CarnetVol;
use App\Entity\Prestation;
use App\Service\ClientGetter;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;

class CarnetVolFactory
{
    private ClientGetter $clientGetter;

    public function __construct(ClientGetter $clientGetter)
    {
        $this->clientGetter = $clientGetter;
    }

    public function createFromPrestation(Prestation $prestation, User $user): Collection
    {
        $carnets = []; 
        $durations = [];       
        $pilote = $prestation->getPilote();
        $vols = $prestation->getVols();

        if ($vols->isEmpty() || !$pilote?->getProfilPilote()) return new ArrayCollection();

        $client = $this->clientGetter->get();
        $aeronef = $prestation->getAeronef();
        $mainAirport = $this->getMainAirport($client);
        $date = \DateTimeImmutable::createFromMutable($prestation->getDate());
        $slicedDifference = $this->getSlicedDurationDifference($prestation);

        foreach ($vols as $vol)
            $durations[] = $this->getRealVolDuration($vol, $slicedDifference);

        $realDuration = \is_null($aeronef) || $aeronef->isDecimal() ? ($prestation->getDuree() ?? 0) : $this->getDecimalTimeFromLocale($prestation->getDuree() ?? 0);

        $sumDurations = array_sum($durations);
        $delta = round($realDuration - $sumDurations, 2);

        if (abs($delta) > 0)
            $durations[array_key_last($durations)] += $delta;

        
        foreach ($vols as $index => $vol) {
            $carnetVol = new CarnetVol();
            $circuit = $vol->getCircuit();
            $landings = $vol->getLandings();
            $destinations = $this->getDestinations($landings, $mainAirport);

            $carnetVol
                ->setProfil($pilote?->getProfilPilote())
                ->setDate($date)
                ->setAeronef($aeronef?->getImmatriculation() ?? "")
                ->setTypeDeVol($circuit?->getNature())
                ->setDuree(round($durations[$index], 2))
                ->setLieuDepart($this->getAirportName($mainAirport))
                ->setLieuxArrivee($destinations)
                ->setIsValidated(true)
                ->setCreatedAt(new \DateTimeImmutable())
                ->setCreatedBy($user);

            $carnets[] = $carnetVol;
        }

        return new ArrayCollection($carnets);
    }

    private function getDestinations(Collection $landings, array $mainAirport): array
    {
        if ($landings->isEmpty()) return [ $this->getAirportName($mainAirport) ];

        $destinations = $landings
            ->filter(fn($landing) => $landing->getTouches() > 0 || $landing->getComplets() > 0)
            ->map(fn($landing) => $this->getAirportName([
                'code' => $landing->getAirportCode(),
                'name' => $landing->getAirportName(),
            ]))
            ->toArray();

        return array_values(array_unique($destinations));
    }

    private function getAirportName(array $airport): string 
    {
        if (empty($airport)) return "";

        $code = $airport['code'] ?? "";
        $name = !empty($airport['name']) ? " - " . $airport['name'] : "";
        return $code . $name;
    }

    private function getMainAirport(Client $client): array
    {
        foreach ($client->getAirports() as $airport) {
            if ($airport->isMain()) {
                return ['code' => $airport->getCode(), 'name' => $airport->getName()];
            }
        }

        return ['code' => '', 'name' => ''];
    }

    private function getRealVolDuration(Vol $vol, float $slicedDifference): float
    {
        $quantite = $vol?->getQuantite() ?? 1;
        $theoretical = $this->getTheoreticalVolDuration($vol);

        return $theoretical + ($quantite * $slicedDifference);
    }

    private function getSlicedDurationDifference(Prestation $prestation): float
    {
        $vols = $prestation->getVols();
        $aeronef = $prestation->getAeronef();
        $duree = $prestation->getDuree() ?? 0;

        $realDuration = \is_null($aeronef) || $aeronef->isDecimal() ? $duree : $this->getDecimalTimeFromLocale($duree);
        $theoreticalDuration = $this->getTheoreticalDuration($vols);

        $difference = $realDuration - $theoreticalDuration;
        $totalQuantities = array_sum(array_map(fn($vol) => $vol->getQuantite() ?? 1, $vols->toArray()));
        $count = max($totalQuantities, 1);
        $slicedDifference = $difference / $count;
        return round($slicedDifference, 2);

    }

    private function getTheoreticalDuration(Collection $vols): float 
    {
        $theoreticalDuration = 0;
        if ($vols->isEmpty()) return 0;

        foreach ($vols as $vol) {
            $theoreticalDuration += $this->getTheoreticalVolDuration($vol);
        }

        return $theoreticalDuration;
    }

    private function getTheoreticalVolDuration(Vol $vol): float 
    {
        $circuit = $vol?->getCircuit();

        if (\is_null($circuit)) return 0;

        $quantite = $vol?->getQuantite() ?? 1;
        $decimalDuration = $this->getTimeToDecimal($circuit->getDuree());

        return $quantite * $decimalDuration;
    }

    private function getDecimalTimeFromLocale(float $duration) : float
    {
        $hours = floor($duration);
        $minutes = ($duration - $hours) * 100;
        $decimal = $hours + ($minutes / 60);
        return round($decimal, 2);
    }

    private function getTimeToDecimal(?\DateTimeInterface $time): float
    {
        if (\is_null($time)) return 0;

        $hours = (int) $time->format('H');
        $minutes = (int) $time->format('i');

        return $hours + ($minutes / 60);
    }
}
