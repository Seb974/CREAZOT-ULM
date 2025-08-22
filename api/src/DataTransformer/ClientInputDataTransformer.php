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
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
        $client->setWebsite($data->website);
        $client->setUrl($data->url);
        $client->setHasReservation($data->hasReservation);
        $client->setHasPassengerRegistration($data->hasPassengerRegistration);
        $client->setHasOriginContact($data->hasOriginContact);
        $client->setHasOptions($data->hasOptions);
        $client->setHasPartners($data->hasPartners);
        $client->setHasGifts($data->hasGifts);
        $client->setThanksTitle($data->thanksTitle);
        $client->setThanksMessage($data->thanksMessage);
        $client->setHasLandingManagement($data->hasLandingManagement);
        $client->setHasEmailConfirmation($data->hasEmailConfirmation);
        $client->setEmailServer($data->emailServer);
        $client->setConfirmationMessage($data->confirmationMessage);
        $client->setEmailAddressSender($data->emailAddressSender);
        $client->setConfirmationSubject($data->confirmationSubject);
        $client->setHasPaymentManagement($data->$hasPaymentManagement);
        $client->setHasMicrotrakTag($data->$hasMicrotrakTag);
        $client->setHasWebshop($data->$hasWebshop);
        $client->setSeuilMedical($data->$seuilMedical);
        $client->setSeuilQualifications($data->$seuilQualifications);

        // Uploads de fichiers
        if ($data->logo instanceof UploadedFile) {
            $client->setLogo($this->fileUploader->upload($data->logo, 'logo'));
        } elseif ($data->logo === 'DELETE') {
            $client->setLogo(null);
        }

        if ($data->favicon instanceof UploadedFile) {
            $client->setFavicon($this->fileUploader->upload($data->favicon, 'favicon'));
        } elseif ($data->favicon === 'DELETE') {
            $client->setFavicon(null);
        }

        if ($data->pdfBackground instanceof UploadedFile) {
            $client->setPdfBackground($this->fileUploader->upload($data->pdfBackground, 'pdfBackground', $data->opacity));
        } elseif ($data->pdfBackground === 'DELETE') {
            $client->setPdfBackground(null);
        }

        if ($data->thanksImage instanceof UploadedFile) {
            $client->setThanksImage($this->fileUploader->upload($data->thanksImage, 'thanksImage'));
        } elseif ($data->thanksImage === 'DELETE') {
            $client->setThanksImage(null);
        }

        if ($data->mapIcon instanceof UploadedFile) {
            $client->setMapIcon($this->fileUploader->upload($data->mapIcon, 'mapIcon'));
        } elseif ($data->mapIcon === 'DELETE') {
            $client->setMapIcon(null);
        }

        return $this->persistProcessor->process($client, $operation, $uriVariables, $context);
    }
}
