<?php

namespace App\Controller;

use App\Dto\ClientInput;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class CreateClientController extends AbstractController
{
    public function __invoke(Request $request, EntityManagerInterface $em): ClientInput
    {
        $dto = new ClientInput();

        // Champs texte
        $dto->name = $request->request->get('name');
        $dto->slug = $request->request->get('slug');
        $dto->email = $request->request->get('email');
        $dto->phone = $request->request->get('phone');
        $dto->color = $request->request->get('color');
        $dto->timezone = $request->request->get('timezone');
        $dto->address = $request->request->get('address');
        $dto->zipcode = $request->request->get('zipcode');
        $dto->city = $request->request->get('city');
        $dto->website = $request->request->get('website');
        $dto->thanksTitle = $request->request->get('thanksTitle');
        $dto->thanksMessage = $request->request->get('thanksMessage');
        $dto->emailServer = $request->request->get('emailServer');
        $dto->confirmationMessage = $request->request->get('confirmationMessage');
        $dto->emailAddressSender = $request->request->get('emailAddressSender');
        $dto->confirmationSubject = $request->request->get('confirmationSubject');

        // Champs Number/ Boolean
        $dto->lat = $this->getFloat($request, 'lat');
        $dto->lng = $this->getFloat($request, 'lng');
        $dto->zoom = $this->getInt($request, 'zoom');
        $dto->opacity = $this->getFloat($request, 'opacity');
        $dto->active = $this->getBool($request, 'active');
        $dto->hasReservation = $this->getBool($request, 'hasReservation');
        $dto->hasPassengerRegistration = $this->getBool($request, 'hasPassengerRegistration');
        $dto->hasOriginContact = $this->getBool($request, 'hasOriginContact');
        $dto->hasOptions = $this->getBool($request, 'hasOptions');
        $dto->hasPartners = $this->getBool($request, 'hasPartners');
        $dto->hasGifts = $this->getBool($request, 'hasGifts');
        $dto->hasLandingManagement = $this->getBool($request, 'hasLandingManagement');
        $dto->hasEmailConfirmation = $this->getBool($request, 'hasEmailConfirmation');

        // Fichiers
        $dto->logo = $request->files->get('logo');
        $dto->favicon = $request->files->get('favicon');
        $dto->pdfBackground = $request->files->get('pdfBackground');
        $dto->mapIcon = $request->files->get('mapIcon');
        $dto->thanksImage = $request->files->get('thanksImage');

        // Champs array
        $dto->camIds = $this->parseArrayField($request, 'camIds');
        $dto->airportCodes = $this->parseArrayField($request, 'airportCodes');

        return $dto;
    }

    private function getFloat(Request $request, string $key): ?float
    {
        $val = $request->request->get($key);
        return $val !== null && $val !== '' ? (float) $val : null;
    }

    private function getInt(Request $request, string $key): ?int
    {
        $val = $request->request->get($key);
        return $val !== null && $val !== '' ? (int) $val : null;
    }

    private function getBool(Request $request, string $key): ?bool
    {
        $val = $request->request->get($key);
        return $val !== null ? filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;
    }

    private function parseArrayField(Request $request, string $field): array
    {
        $value = $request->request->get($field);

        if (is_string($value) && str_starts_with(trim($value), '[')) {
            $json = json_decode($value, true);
            return json_last_error() === JSON_ERROR_NONE ? $json : [];
        }

        if (is_array($value)) {
            return $value;
        }

        return [];
    }
}
