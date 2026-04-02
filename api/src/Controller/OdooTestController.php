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
            $xmlPayload = $this->buildXmlRpc('authenticate', [
                ['string', $db],
                ['string', $user],
                ['string', $apiKey],
                ['struct', []],
            ]);

            $response = $this->httpClient->request('POST', $url . '/xmlrpc/2/common', [
                'headers' => ['Content-Type' => 'text/xml'],
                'body' => $xmlPayload,
                'timeout' => 10,
            ]);

            $content = $response->getContent(false);
            $statusCode = $response->getStatusCode();

            if ($statusCode !== 200) {
                return $this->json([
                    'success' => false,
                    'message' => sprintf('Odoo a répondu avec le code HTTP %d.', $statusCode),
                ]);
            }

            if (str_contains($content, '<fault>')) {
                preg_match('/<string>(.*?)<\/string>/s', $content, $m);
                $faultMsg = $m[1] ?? 'Erreur inconnue';
                return $this->json([
                    'success' => false,
                    'message' => 'Authentification échouée : ' . html_entity_decode(strip_tags($faultMsg)),
                ]);
            }

            preg_match('/<value><int>(\d+)<\/int><\/value>/', $content, $uidMatch);
            $uid = $uidMatch[1] ?? null;

            if (!$uid || $uid === '0') {
                return $this->json([
                    'success' => false,
                    'message' => 'Identifiants incorrects. Vérifiez l\'utilisateur et la clé API.',
                ]);
            }

            $versionXml = $this->buildXmlRpc('version', []);
            $versionResponse = $this->httpClient->request('POST', $url . '/xmlrpc/2/common', [
                'headers' => ['Content-Type' => 'text/xml'],
                'body' => $versionXml,
                'timeout' => 10,
            ]);
            $versionContent = $versionResponse->getContent(false);
            preg_match('/<name>server_version<\/name>\s*<value><string>(.*?)<\/string><\/value>/', $versionContent, $verMatch);
            $version = $verMatch[1] ?? null;

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

    private function buildXmlRpc(string $method, array $params): string
    {
        $xml = '<?xml version="1.0"?>';
        $xml .= '<methodCall>';
        $xml .= '<methodName>' . $method . '</methodName>';
        $xml .= '<params>';

        foreach ($params as $param) {
            $xml .= '<param><value>';
            $xml .= $this->xmlRpcValue($param[0], $param[1]);
            $xml .= '</value></param>';
        }

        $xml .= '</params>';
        $xml .= '</methodCall>';

        return $xml;
    }

    private function xmlRpcValue(string $type, mixed $value): string
    {
        return match ($type) {
            'string' => '<string>' . htmlspecialchars((string) $value) . '</string>',
            'int', 'i4' => '<int>' . (int) $value . '</int>',
            'boolean' => '<boolean>' . ($value ? '1' : '0') . '</boolean>',
            'struct' => '<struct></struct>',
            default => '<string>' . htmlspecialchars((string) $value) . '</string>',
        };
    }
}
