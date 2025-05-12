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

        $dto->name = $request->request->get('name');
        $dto->slug = $request->request->get('slug');
        $dto->email = $request->request->get('email');
        $dto->phone = $request->request->get('phone');
        $dto->color = $request->request->get('color');
        $dto->lat = $request->request->get('lat');
        $dto->lng = $request->request->get('lng');
        $dto->zoom = $request->request->get('zoom');
        $dto->opacity = $request->request->get('opacity');
        $dto->active = $request->request->get('active');
        $dto->timezone = $request->request->get('timezone');
        $dto->address = $request->request->get('address');
        $dto->zipcode = $request->request->get('zipcode');
        $dto->city = $request->request->get('city');

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
            $dto->camIds = [];
        }
        
        $airportCodes = $request->request->get('airportCodes');
        if (is_string($airportCodes) && str_starts_with(trim($airportCodes), '[')) {
            $dto->airportCodes = json_decode($airportCodes, true);
        } elseif (is_array($airportCodes)) {
            $dto->airportCodes = $airportCodes;
        } else {
            $dto->airportCodes = [];
        }

        return $dto;
    }
}
