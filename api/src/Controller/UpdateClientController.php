<?php

namespace App\Controller;

use App\Dto\ClientInput;
use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class UpdateClientController extends AbstractController
{
    public function __invoke(Request $request, EntityManagerInterface $em): ClientInput
    {
        /** @var Client|null $existingClient */
        $existingClient = $request->attributes->get('data');

        if (!$existingClient) {
            throw new NotFoundHttpException('Client not found');
        }

        $dto = new ClientInput();

        // Champs texte
        $dto->name = $request->request->get('name', $existingClient->getName());
        $dto->slug = $request->request->get('slug', $existingClient->getSlug());
        $dto->email = $request->request->get('email', $existingClient->getEmail());
        $dto->phone = $request->request->get('phone', $existingClient->getPhone());
        $dto->color = $request->request->get('color', $existingClient->getColor());
        $dto->lat = $request->request->get('lat', $existingClient->getLat());
        $dto->lng = $request->request->get('lng', $existingClient->getLng());
        $dto->zoom = $request->request->get('zoom', $existingClient->getZoom());
        // $dto->camIds = $request->request->all('camIds') ?: $existingClient->getCamIds();
        // $dto->airportCodes = $request->request->all('airportCodes') ?: $existingClient->getAirportCodes();
        $dto->opacity = $request->request->get('opacity', $existingClient->getOpacity());
        $dto->active = $request->request->get('active', $existingClient->isActive());
        $dto->timezone = $request->request->get('timezone', $existingClient->getTimezone());
        $dto->address = $request->request->get('address', $existingClient->getAddress());
        $dto->zipcode = $request->request->get('zipcode', $existingClient->getZipcode());
        $dto->city = $request->request->get('city', $existingClient->getCity());

        // Fichiers
        $dto->logo = $request->files->get('logo');
        $dto->favicon = $request->files->get('favicon');
        $dto->pdfBackground = $request->files->get('pdfBackground');
        $dto->mapIcon = $request->files->get('mapIcon');

        $camIds = $request->request->get('camIds');
        if (is_string($camIds) && str_starts_with(trim($camIds), '[')) {
            $dto->camIds = json_decode($camIds, true);
        } elseif (is_array($camIds)) {
            $dto->camIds = $camIds;
        } else {
            $dto->camIds = $existingClient->getCamIds();
        }

        $airportCodes = $request->request->get('airportCodes');
        if (is_string($airportCodes) && str_starts_with(trim($airportCodes), '[')) {
            $dto->airportCodes = json_decode($airportCodes, true);
        } elseif (is_array($airportCodes)) {
            $dto->airportCodes = $airportCodes;
        } else {
            $dto->airportCodes = $existingClient->getAirportCodes();
        }

        return $dto;
    }
}
