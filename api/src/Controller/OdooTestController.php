<?php

namespace App\Controller;

use App\Repository\SiteSettingsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OdooTestController extends AbstractController
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
    ) {}

    #[Route('/admin/odoo/test-connection', name: 'odoo_test_connection', methods: ['POST'])]
    public function testConnection(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true) ?? [];

        $url     = trim($payload['url'] ?? '');
        $db      = trim($payload['db'] ?? '');
        $user    = trim($payload['user'] ?? '');
        $apiKey  = trim($payload['apiKey'] ?? '');

        if (!$url || !$db || !$user || !$apiKey) {
            return $this->json([
                'success' => false,
                'message' => 'Tous les champs (URL, Base de données, Utilisateur, Clé API) sont requis.',
            ], 422);
        }

        $url = rtrim($url, '/');

        try {
            $authResponse = $this->odooJsonRpc($url, 'common', 'authenticate', [$db, $user, $apiKey, []]);

            if (isset($authResponse['error'])) {
                $msg = $authResponse['error']['data']['message']
                    ?? $authResponse['error']['message']
                    ?? 'Erreur inconnue';
                return $this->json([
                    'success' => false,
                    'message' => 'Authentification échouée : ' . $msg,
                ]);
            }

            $uid = $authResponse['result'] ?? null;

            if (!$uid || $uid === false) {
                return $this->json([
                    'success' => false,
                    'message' => 'Identifiants incorrects. Vérifiez l\'utilisateur et la clé API.',
                ]);
            }

            $versionResponse = $this->odooJsonRpc($url, 'common', 'version', []);
            $version = $versionResponse['result']['server_version'] ?? null;

            $message = sprintf('Connexion réussie ! (UID: %s', $uid);
            if ($version) {
                $message .= sprintf(', Odoo %s', $version);
            }
            $message .= ')';

            return $this->json([
                'success' => true,
                'message' => $message,
                'uid' => (int) $uid,
                'version' => $version,
            ]);

        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'Could not resolve host') || str_contains($msg, 'getaddrinfo')) {
                $msg = sprintf('Impossible de joindre le serveur "%s". Vérifiez l\'URL.', $url);
            } elseif (str_contains($msg, 'Connection refused')) {
                $msg = sprintf('Connexion refusée par le serveur "%s".', $url);
            } elseif (str_contains($msg, 'timed out')) {
                $msg = sprintf('Le serveur "%s" ne répond pas (timeout).', $url);
            }

            return $this->json([
                'success' => false,
                'message' => $msg,
            ]);
        }
    }

    private function odooJsonRpc(string $baseUrl, string $service, string $method, array $args): array
    {
        $response = $this->httpClient->request('POST', $baseUrl . '/jsonrpc', [
            'headers' => ['Content-Type' => 'application/json'],
            'timeout' => 10,
            'body' => json_encode([
                'jsonrpc' => '2.0',
                'method' => 'call',
                'id' => random_int(1, 999999),
                'params' => [
                    'service' => $service,
                    'method' => $method,
                    'args' => $args,
                ],
            ]),
        ]);

        return json_decode($response->getContent(false), true) ?? [];
    }
}
