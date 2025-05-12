<?php

namespace App\DataTransformer;

use ApiPlatform\Symfony\Validator\Exception\ValidationException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Dto\ClientInput;
use App\Entity\Client;
use App\Service\FileUploader;

class ClientInputDataTransformer implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $persistProcessor,
        private readonly ValidatorInterface $validator,
        private readonly FileUploader $fileUploader,
        private readonly ProviderInterface $itemProvider
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Client
    {
        $this->validator->validate($data);

        // Récupère un Client existant ou en crée un nouveau
        $shouldHydrateExistingClient = isset($context['input']['class'])
            && $context['input']['class'] === ClientInput::class
            && isset($uriVariables['id']);

        $client = $shouldHydrateExistingClient
            ? $this->itemProvider->provide($operation->withClass(Client::class), $uriVariables, $context)
            : new Client();

        $client->setName($data->name);
        $client->setSlug($data->slug);
        $client->setEmail($data->email);
        $client->setPhone($data->phone);
        $client->setColor($data->color);
        $client->setLat($data->lat);
        $client->setLng($data->lng);
        $client->setZoom($data->zoom);
        $client->setCamIds($data->camIds);
        $client->setAirportCodes($data->airportCodes);
        $client->setOpacity($data->opacity);
        $client->setActive($data->active);
        $client->setTimezone($data->timezone);
        $client->setAddress($data->address);
        $client->setZipcode($data->zipcode);
        $client->setCity($data->city);

        // Uploads de fichiers
        if ($data->logo) {
            $client->setLogo($this->fileUploader->upload($data->logo, 'logo'));
        }
        if ($data->favicon) {
            $client->setFavicon($this->fileUploader->upload($data->favicon, 'favicon'));
        }
        if ($data->pdfBackground) {
            $client->setPdfBackground($this->fileUploader->upload($data->pdfBackground, 'pdfBackground', $data->opacity));
        }
        if ($data->mapIcon) {
            $client->setMapIcon($this->fileUploader->upload($data->mapIcon, 'mapIcon'));
        }

        return $this->persistProcessor->process($client, $operation, $uriVariables, $context);
    }
}
