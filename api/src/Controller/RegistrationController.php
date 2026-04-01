<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Entity\User;
use App\Repository\ModulePackRepository;
use App\Repository\PricingCategoryRepository;
use App\Repository\UserRepository;
use App\Service\KeycloakAdminService;
use App\Service\PricingCalculatorService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

class RegistrationController extends AbstractController
{
    #[Route('/api/registration', name: 'api_registration', methods: ['POST'])]
    public function __invoke(
        Request $request,
        UserRepository $userRepository,
        KeycloakAdminService $keycloakAdmin,
        EntityManagerInterface $em,
        ModulePackRepository $modulePackRepository,
        PricingCategoryRepository $pricingCategoryRepository,
        PricingCalculatorService $pricingCalculator,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON body'], Response::HTTP_BAD_REQUEST);
        }

        // --- a) Validation ---
        $errors = $this->validatePayload($data);
        if (!empty($errors)) {
            return new JsonResponse(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $club = $data['club'];
        $modules = $data['modules'] ?? [];
        $userData = $data['user'];

        $email = trim($userData['email']);
        $firstName = trim($userData['firstName']);
        $lastName = trim($userData['lastName']);
        $password = $userData['password'];

        $clubName = trim($club['name']);
        $city = trim($club['city']);
        $phone = $club['phone'] ?? null;
        $clubEmail = $club['email'] ?? null;

        $packIds = $modules['packIds'] ?? [];
        $nbAeronefs = $modules['nbAeronefs'] ?? 1;

        // --- b) Vérifier unicité email ---
        $existingUser = $userRepository->findOneBy(['email' => $email]);
        if ($existingUser) {
            return new JsonResponse(
                ['error' => 'Un compte avec cet email existe déjà'],
                Response::HTTP_CONFLICT
            );
        }

        // --- c) Créer user dans Keycloak ---
        try {
            $keycloakId = $keycloakAdmin->createUser($email, $firstName, $lastName, $password);
        } catch (\RuntimeException $e) {
            $code = $e->getCode() === 409 ? Response::HTTP_CONFLICT : Response::HTTP_BAD_GATEWAY;
            return new JsonResponse(['error' => $e->getMessage()], $code);
        }

        // --- c2) Assigner le rôle admin dans Keycloak ---
        try {
            $keycloakAdmin->assignRealmRole($keycloakId, 'admin');
        } catch (\RuntimeException $e) {
            // Non bloquant : l'utilisateur est créé, le rôle pourra être assigné manuellement
        }

        try {
            // --- d) Créer le User entity ---
            $user = new User();
            $user->setId(Uuid::fromString($keycloakId));
            $user->email = $email;
            $user->firstName = $firstName;
            $user->lastName = $lastName;
            $user->setKeycloakId($keycloakId);
            $user->setRoles(['OIDC_ADMIN']);

            // --- e) Créer le Client entity ---
            $client = new Client();
            $client->setName($clubName);
            $client->setSlug($this->slugify($clubName));
            $client->setCity($city);
            $client->setPhone($phone);
            $client->setEmail($clubEmail);
            $client->setSubscriptionStatus('trial');
            $client->setTrialEndsAt(new \DateTimeImmutable('+30 days'));
            $client->setActive(true);
            $client->setMaxAeronefs($nbAeronefs);

            $defaultCategory = $pricingCategoryRepository->findOneBy(['isDefault' => true]);
            if ($defaultCategory) {
                $client->setPricingCategory($defaultCategory);
            }

            // --- f) Associer les ModulePacks ---
            $basePack = $modulePackRepository->findOneBy(['isDefault' => true]);
            if ($basePack) {
                $client->addModulePack($basePack);
            }

            foreach ($packIds as $packId) {
                $pack = $modulePackRepository->find($packId);
                if ($pack) {
                    $client->addModulePack($pack);
                }
            }

            // --- g) Associer User ↔ Client ---
            $user->addClient($client);

            // --- h) Persister ---
            $em->persist($client);
            $em->persist($user);
            $em->flush();

            // --- i) Recalculer la tarification ---
            $pricingCalculator->recalculateForClient($client);

        } catch (\Throwable $e) {
            // Rollback Keycloak si la persistence échoue
            try {
                $keycloakAdmin->deleteUser($keycloakId);
            } catch (\Throwable) {
                // Best effort cleanup
            }

            return new JsonResponse(
                ['error' => 'Erreur lors de la création du compte : ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        // --- j) Réponse ---
        return new JsonResponse([
            'success' => true,
            'verifyEmail' => true,
            'clientId' => $client->getId(),
        ], Response::HTTP_CREATED);
    }

    /**
     * @return string[]
     */
    private function validatePayload(array $data): array
    {
        $errors = [];

        if (empty($data['club']['name'])) {
            $errors[] = 'club.name est requis';
        }
        if (empty($data['club']['city'])) {
            $errors[] = 'club.city est requis';
        }
        if (empty($data['user']['firstName'])) {
            $errors[] = 'user.firstName est requis';
        }
        if (empty($data['user']['lastName'])) {
            $errors[] = 'user.lastName est requis';
        }
        if (empty($data['user']['email'])) {
            $errors[] = 'user.email est requis';
        } elseif (!filter_var($data['user']['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'user.email n\'est pas une adresse email valide';
        }

        $password = $data['user']['password'] ?? '';
        if (empty($password)) {
            $errors[] = 'user.password est requis';
        } elseif (strlen($password) < 8) {
            $errors[] = 'Le mot de passe doit contenir au moins 8 caractères';
        } elseif (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins une majuscule';
        } elseif (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins un chiffre';
        }

        return $errors;
    }

    private function slugify(string $text): string
    {
        $text = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        return trim($text, '-');
    }
}
