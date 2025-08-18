<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Service\DynamicMailerFactory;
use App\Service\ClientGetter;
use Symfony\Component\Mime\Email;

class WixController extends AbstractController
{
    private string $webhookSecret;
    private DynamicMailerFactory $mailerFactory;
    private ClientGetter $clientGetter;

    public function __construct(string $webhookSecret, DynamicMailerFactory $mailerFactory, ClientGetter $clientGetter)
    {
        $this->webhookSecret = $webhookSecret;
        $this->mailerFactory = $mailerFactory;
        $this->clientGetter = $clientGetter;
    }

    #[Route('/wix/purchase', methods: ['POST'])]
    public function wixPurchase(Request $request): Response
    {
        $rawBody = $request->getContent();
        $signatureHeader = $request->headers->get('X-Wix-Velo-Hmac', '');
        $calculated = base64_encode(hash_hmac('sha256', $rawBody, $this->webhookSecret, true));

        if (!hash_equals($calculated, $signatureHeader)) {
            return new Response('Signature invalide', Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($rawBody, true);
        
        // → logique : créer une réservation, etc.
        $client = $this->clientGetter->get();
        if (!$client->getEmailServer() || !$client->getEmailAddressSender()) {
            return new Response('Client mail config missing', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $mailer = $this->mailerFactory->getMailerForClient();
            $email = (new Email())
                ->from($client->getEmailAddressSender())
                ->to("sebastien.maillot@gmx.fr")
                ->subject('Webhook Wix - Payload brut')
                ->html('<pre>' . json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>');

            $mailer->send($email);
        } catch (\Throwable $e) {
            return new Response('Erreur envoi email', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new Response('OK', Response::HTTP_OK);
    }
}