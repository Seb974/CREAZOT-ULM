<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Service\DynamicMailerFactory;
use App\Service\ClientGetter;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;

class WixController extends AbstractController
{
    private string $webhookSecret;
    private DynamicMailerFactory $mailerFactory;
    private ClientGetter $clientGetter;
    private LoggerInterface $logger;

    public function __construct(string $webhookSecret, DynamicMailerFactory $mailerFactory, ClientGetter $clientGetter, LoggerInterface $logger)
    {
        $this->webhookSecret = trim($webhookSecret);;
        $this->mailerFactory = $mailerFactory;
        $this->clientGetter = $clientGetter;
        $this->logger = $logger;
    }

    #[Route('/wix/purchase', methods: ['POST'])]
    public function wixPurchase(Request $request): Response
    {
        $raw = $request->getContent();
        $signatureHeader = trim($request->headers->get('X-Wix-Velo-Hmac', ''));
        $calculatedHmac = base64_encode(hash_hmac('sha256', $raw, $this->webhookSecret, true));

        if (!hash_equals($calculatedHmac, $signatureHeader)) {
            $this->logger->error('Wix webhook debug', [
                'secret-symfony-side' => $this->webhookSecret,
                'signatureHeader' => $signatureHeader,
                'calculatedHmac' => $calculatedHmac,
                'equalHmac64' => hash_equals($calculatedHmac, $signatureHeader) ? 'yes' : 'no',
            ]);
            return new Response('Signature invalide', Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($raw, true);
        if (!$payload) {
            return new Response('JSON invalide', Response::HTTP_BAD_REQUEST);
        }
        
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