<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Entity\Client;
use App\Entity\UserClientRole;
use App\Service\KeycloakAdminService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UserManagementController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private KeycloakAdminService $keycloakAdmin,
    ) {}

    #[Route('/api/users/{id}/role', name: 'user_change_role', methods: ['PATCH'])]
    #[IsGranted('OIDC_ADMIN')]
    public function changeRole(string $id, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $newRole = $data['role'] ?? null;

        if (!in_array($newRole, ['admin', 'pilot'], true)) {
            return new JsonResponse(['error' => 'Role invalide (admin ou pilot)'], 400);
        }

        $clientId = $request->headers->get('X-Client-Id');
        if (!$clientId) {
            return new JsonResponse(['error' => 'X-Client-Id requis'], 400);
        }

        $client = $this->em->getRepository(Client::class)->find((int) $clientId);
        if (!$client) {
            return new JsonResponse(['error' => 'Client introuvable'], 404);
        }

        $ucr = $this->em->getRepository(UserClientRole::class)->findOneBy([
            'user' => $user,
            'client' => $client,
        ]);

        if (!$ucr) {
            return new JsonResponse(['error' => 'Utilisateur non rattaché à ce client'], 400);
        }

        $ucr->setRole($newRole);
        $this->em->flush();

        return new JsonResponse([
            'success' => true,
            'role' => $ucr->getRole(),
        ]);
    }

    #[Route('/api/users/{userId}/detach/{clientId}', name: 'user_detach_client', methods: ['DELETE'])]
    #[IsGranted('OIDC_ADMIN')]
    public function detachFromClient(string $userId, int $clientId): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);
        }

        $client = $this->em->getRepository(Client::class)->find($clientId);
        if (!$client) {
            return new JsonResponse(['error' => 'Client introuvable'], 404);
        }

        if (!$user->hasClient($client)) {
            return new JsonResponse(['error' => "Utilisateur non rattaché à ce client"], 400);
        }

        $ucr = $this->em->getRepository(UserClientRole::class)->findOneBy([
            'user' => $user,
            'client' => $client,
        ]);
        if ($ucr) {
            $this->em->remove($ucr);
        }

        $user->removeClient($client);
        $this->em->flush();

        return new JsonResponse(['success' => true]);
    }
}
