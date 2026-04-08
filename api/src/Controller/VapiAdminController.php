<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Service\VapiService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/vapi')]
#[IsGranted('OIDC_ADMIN')]
class VapiAdminController extends AbstractController
{
    public function __construct(
        private VapiService $vapiService,
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {}

    #[Route('/setup-assistant/{clientId}', name: 'vapi_setup_assistant', methods: ['POST'])]
    public function setupAssistant(int $clientId, Request $request): JsonResponse
    {
        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé'], 404);
        }

        if (!$client->isHasVoiceAssistant()) {
            return new JsonResponse(['error' => 'Le module Assistant Vocal n\'est pas activé pour ce client.'], 403);
        }

        $serverUrl = $request->getSchemeAndHttpHost() . '/webhook/vapi';
        $existingAssistantId = $client->getVapiAssistantId();

        try {
            if ($existingAssistantId) {
                $this->vapiService->updateAssistant(
                    $existingAssistantId,
                    $client->getName() ?? 'Club',
                    $serverUrl,
                    $clientId
                );
                return new JsonResponse([
                    'success' => true,
                    'action' => 'updated',
                    'assistant_id' => $existingAssistantId,
                    'message' => "Assistant Vapi mis à jour pour {$client->getName()}.",
                ]);
            }

            $result = $this->vapiService->createAssistant(
                $client->getName() ?? 'Club',
                $serverUrl,
                $clientId
            );

            $newAssistantId = $result['id'] ?? null;
            if ($newAssistantId) {
                $client->setVapiAssistantId($newAssistantId);
                $this->em->flush();
            }

            return new JsonResponse([
                'success' => true,
                'action' => 'created',
                'assistant_id' => $newAssistantId,
                'message' => "Assistant Vapi créé pour {$client->getName()}.",
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Vapi setup error: {error}', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/test-connection', name: 'vapi_test_connection', methods: ['GET'])]
    public function testConnection(): JsonResponse
    {
        try {
            $assistants = $this->vapiService->listAssistants();

            return new JsonResponse([
                'success' => true,
                'message' => 'Connexion Vapi OK.',
                'assistants_count' => is_array($assistants) ? count($assistants) : 0,
            ]);
        } catch (\Throwable $e) {
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    #[Route('/assistant-status/{clientId}', name: 'vapi_assistant_status', methods: ['GET'])]
    public function assistantStatus(int $clientId): JsonResponse
    {
        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé'], 404);
        }

        $assistantId = $client->getVapiAssistantId();
        if (!$assistantId) {
            return new JsonResponse([
                'configured' => false,
                'message' => 'Aucun assistant configuré pour ce client.',
            ]);
        }

        try {
            $assistant = $this->vapiService->getAssistant($assistantId);
            return new JsonResponse([
                'configured' => true,
                'assistant_id' => $assistantId,
                'assistant_name' => $assistant['name'] ?? null,
                'created_at' => $assistant['createdAt'] ?? null,
            ]);
        } catch (\Throwable $e) {
            return new JsonResponse([
                'configured' => true,
                'assistant_id' => $assistantId,
                'error' => 'Assistant introuvable sur Vapi : ' . $e->getMessage(),
            ]);
        }
    }

    #[Route('/calls', name: 'vapi_list_calls', methods: ['GET'])]
    public function listCalls(): JsonResponse
    {
        try {
            $calls = $this->vapiService->listCalls(50);
            return new JsonResponse($calls);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/phone-numbers', name: 'vapi_phone_numbers', methods: ['GET'])]
    public function phoneNumbers(): JsonResponse
    {
        try {
            $numbers = $this->vapiService->listPhoneNumbers();
            return new JsonResponse($numbers);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
