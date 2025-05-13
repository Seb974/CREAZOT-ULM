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

        // Champs Number/ Boolean
        $dto->lat = $this->getFloat($request, 'lat');
        $dto->lng = $this->getFloat($request, 'lng');
        $dto->zoom = $this->getInt($request, 'zoom');
        $dto->opacity = $this->getFloat($request, 'opacity');
        $dto->active = $this->getBool($request, 'active');

        // Fichiers
        $dto->logo = $request->files->get('logo');
        $dto->favicon = $request->files->get('favicon');
        $dto->pdfBackground = $request->files->get('pdfBackground');
        $dto->mapIcon = $request->files->get('mapIcon');

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
