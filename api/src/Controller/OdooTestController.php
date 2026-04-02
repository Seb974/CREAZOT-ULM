<?php

namespace App\Controller;

use App\Entity\SiteSettings;
use App\Repository\SiteSettingsRepository;
use App\Service\OdooJsonRpcService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class OdooTestController extends AbstractController
{
    public function __construct(
        private OdooJsonRpcService $odooService,
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

        if ($apiKey === SiteSettings::API_KEY_MASK) {
            $settings = $this->siteSettingsRepo->findInstance();
            $apiKey = $settings?->getOdooApiKey() ?? '';
        }

        if (!$url || !$db || !$user || !$apiKey) {
            return $this->json([
                'success' => false,
                'message' => 'Tous les champs (URL, Base de données, Utilisateur, Clé API) sont requis.',
            ], 422);
        }

        try {
            $result = $this->odooService->testConnection($url, $db, $user, $apiKey);
            return $this->json($result);
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'Could not resolve host') || str_contains($msg, 'getaddrinfo')) {
                $msg = sprintf('Impossible de joindre le serveur "%s". Vérifiez l\'URL.', $url);
            } elseif (str_contains($msg, 'Connection refused')) {
                $msg = sprintf('Connexion refusée par le serveur "%s".', $url);
            } elseif (str_contains($msg, 'timed out')) {
                $msg = sprintf('Le serveur "%s" ne répond pas (timeout).', $url);
            }

            return $this->json(['success' => false, 'message' => $msg]);
        }
    }
}
