<?php

namespace App\Factory\Prepayment;

use App\Entity\Cadeau;
use App\Entity\Combinaison;
use App\Entity\Circuit;
use App\Entity\Origine;
use App\Repository\CircuitRepository;
use App\Repository\CombinaisonRepository;
use App\Repository\OrigineRepository;
use DateTimeImmutable;

class WixPrepaymentFactory implements PrepaymentFactoryInterface
{
    public function __construct(
        private CircuitRepository $circuitRepository,
        private CombinaisonRepository $combinaisonRepository,
        private OrigineRepository $origineRepository
    ) {}

    public function createPrepaymentFromPayload(array $payload): array
    {
        $prepayments = [];
        if (empty($payload['lineItems'])) {
            return $prepayments;
        }

        $code = $this->generateCode();
        $creationDate = $this->getDate($payload['_dateCreated'] ?? null, 'now');
        $startValidity = \DateTime::createFromImmutable($creationDate);
        $endValidity = $this->getEndValidity($creationDate);
        $paymentId = $this->getString($payload['number'] ?? null, '');
        $offreur = $this->getIdentity($payload['buyerInfo'] ?? []);
        $beneficiaire = $this->getIdentity($payload['shippingInfo']['shipmentDetails'] ?? []);
        $email = $this->getString($payload['buyerInfo']['email'] ?? null, '');
        $telephone = $this->getString($payload['shippingInfo']['shipmentDetails']['phone'] ?? null, '');
        $isGift = !$this->isSamePerson($offreur, $beneficiaire);
        $origine = $this->getOrigine($this->getString($payload['channelInfo']['type'] ?? null, 'web'));

        foreach ($payload['lineItems'] as $item) {
            $prepayment = new Cadeau();
            $webshopId = $this->getString($item['productId'] ?? null, '');
            $quantity = $this->getInt($item['quantity'] ?? 1, 1);

            $circuit = $this->circuitRepository->findOneBy(['webshopId' => $webshopId]);
            $options = $this->getOptions($item, $quantity);
            $prixTotal = $this->getFloat($item['totalPrice'] ?? null, $this->getDefaultPrice($circuit, $options, $quantity));

            $prepayment->setQuantite($quantity)
                ->setDate($startValidity)
                ->setFin($endValidity)
                ->setCode($code)
                ->setPaymentId($paymentId)
                ->setOffreur($offreur)
                ->setBeneficiaire($beneficiaire)
                ->setEmail($email)
                ->setTelephone($telephone)
                ->setGift($isGift)
                ->setSendEmail(false)
                ->setUsed(false)
                ->setCircuit($circuit)
                ->setOptions($options)
                ->addOrigine($origine)
                ->setPrix($prixTotal);

            $prepayments[] = $prepayment;
        }

        return $prepayments;
    }

    private function generateCode(): string
    {
        return substr(base_convert(time(), 10, 36), -6) . substr(base_convert(mt_rand(), 10, 36), 0, 6);
    }


    private function getOptions(array $item, int $quantity): ?Combinaison
    {
        $noOptions = ['aucune', 'sans option'];
        if (empty($item['options'])) return null;

        foreach ($item['options'] as $option) {
            $selection = trim(strtolower($option['selection'] ?? ''));
            if (!in_array($selection, $noOptions, true)) {
                $optionName = $this->mapWixOptionToSite($option['selection'], $quantity);
                return $this->combinaisonRepository->findOneBy(['nom' => $optionName]);
            }
        }

        return null;
    }

    private function mapWixOptionToSite(string $wixOption, int $quantity): string
    {
        return $quantity >= 2 ? '2 Portes Photos' : 'Porte Photos';
    }

    private function getDefaultPrice(?Circuit $circuit, ?Combinaison $options, int $quantity): float
    {
        $circuitPrice = $circuit ? $this->getFloat($circuit->getPrix(), 0) : 0;
        $optionsPrice = $options ? $this->getFloat($options->getPrix(), 0) : 0;
        return $quantity * ($circuitPrice + $optionsPrice);
    }

    private function getOrigine(string $origine): ?Origine
    {
        return $this->origineRepository->findOneByNameInsensitive($origine);
    }

    private function getEndValidity(DateTimeImmutable $date): \DateTime
    {
        return \DateTime::createFromImmutable($date->modify('+1 year +1 day'));
    }

    private function isSamePerson(string $buyer, string $receiver): bool
    {
        return strtolower($buyer) === strtolower($receiver);
    }

    private function getIdentity(array $person): string
    {
        $firstName = $this->getString($person['firstName'] ?? null, '');
        $lastName = $this->getString($person['lastName'] ?? null, '');
        return trim($firstName . ' ' . strtoupper($lastName));
    }

    private function getDate($value, string $default): DateTimeImmutable
    {
        return $value ? new DateTimeImmutable($value) : new DateTimeImmutable($default);
    }

    private function getInt($value, int $default): int
    {
        return $value !== null ? intval($value) : $default;
    }

    private function getFloat($value, float $default): float
    {
        return $value !== null ? floatval($value) : $default;
    }

    private function getString($value, string $default): string
    {
        return $value !== null ? strval($value) : $default;
    }
}
