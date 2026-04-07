<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class KeycloakAdminService
{
    private string $keycloakBaseUrl;
    private string $realm;
    private string $adminUser;
    private string $adminPassword;

    public function __construct(
        private HttpClientInterface $httpClient,
        string $keycloakBaseUrl,
        string $keycloakRealm,
        string $keycloakAdminUser,
        string $keycloakAdminPassword,
    ) {
        $this->keycloakBaseUrl = rtrim($keycloakBaseUrl, '/');
        $this->realm = $keycloakRealm;
        $this->adminUser = $keycloakAdminUser;
        $this->adminPassword = $keycloakAdminPassword;
    }

    public function getAdminToken(): string
    {
        $response = $this->httpClient->request('POST', "{$this->keycloakBaseUrl}/realms/master/protocol/openid-connect/token", [
            'body' => [
                'grant_type' => 'password',
                'client_id' => 'admin-cli',
                'username' => $this->adminUser,
                'password' => $this->adminPassword,
            ],
        ]);

        $data = $response->toArray();

        if (!isset($data['access_token'])) {
            throw new \RuntimeException('Failed to obtain Keycloak admin token');
        }

        return $data['access_token'];
    }

    /**
     * @return string The Keycloak user ID
     */
    public function createUser(string $email, string $firstName, string $lastName, string $password): string
    {
        $token = $this->getAdminToken();

        $response = $this->httpClient->request('POST', "{$this->keycloakBaseUrl}/admin/realms/{$this->realm}/users", [
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'username' => $email,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'enabled' => true,
                'emailVerified' => false,
                'credentials' => [
                    [
                        'type' => 'password',
                        'value' => $password,
                        'temporary' => false,
                    ],
                ],
                'requiredActions' => ['VERIFY_EMAIL'],
            ],
        ]);

        $statusCode = $response->getStatusCode();

        if ($statusCode === 409) {
            throw new \RuntimeException('Un utilisateur avec cet email existe déjà dans Keycloak', 409);
        }

        if ($statusCode !== 201) {
            throw new \RuntimeException(
                sprintf('Keycloak user creation failed (HTTP %d): %s', $statusCode, $response->getContent(false))
            );
        }

        $locationHeader = $response->getHeaders()['location'][0] ?? '';
        $keycloakId = basename($locationHeader);

        if (empty($keycloakId)) {
            throw new \RuntimeException('Could not extract Keycloak user ID from Location header');
        }

        return $keycloakId;
    }

    /**
     * Assign a realm-level role to a Keycloak user.
     */
    public function assignRealmRole(string $keycloakUserId, string $roleName): void
    {
        $token = $this->getAdminToken();
        $baseUrl = "{$this->keycloakBaseUrl}/admin/realms/{$this->realm}";
        $headers = [
            'Authorization' => "Bearer {$token}",
            'Content-Type' => 'application/json',
        ];

        $response = $this->httpClient->request('GET', "{$baseUrl}/roles/{$roleName}", [
            'headers' => $headers,
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException(sprintf('Realm role "%s" not found in Keycloak', $roleName));
        }

        $role = $response->toArray();

        $this->httpClient->request('POST', "{$baseUrl}/users/{$keycloakUserId}/role-mappings/realm", [
            'headers' => $headers,
            'json' => [
                [
                    'id' => $role['id'],
                    'name' => $role['name'],
                ],
            ],
        ]);
    }

    public function deleteUser(string $keycloakId): void
    {
        $token = $this->getAdminToken();

        $this->httpClient->request('DELETE', "{$this->keycloakBaseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}", [
            'headers' => [
                'Authorization' => "Bearer {$token}",
            ],
        ]);
    }

    /**
     * Remove a realm-level role from a Keycloak user.
     */
    public function removeRealmRole(string $keycloakUserId, string $roleName): void
    {
        $token = $this->getAdminToken();
        $baseUrl = "{$this->keycloakBaseUrl}/admin/realms/{$this->realm}";
        $headers = [
            'Authorization' => "Bearer {$token}",
            'Content-Type' => 'application/json',
        ];

        $response = $this->httpClient->request('GET', "{$baseUrl}/roles/{$roleName}", [
            'headers' => $headers,
        ]);

        if ($response->getStatusCode() !== 200) {
            return;
        }

        $role = $response->toArray();

        $this->httpClient->request('DELETE', "{$baseUrl}/users/{$keycloakUserId}/role-mappings/realm", [
            'headers' => $headers,
            'json' => [
                [
                    'id' => $role['id'],
                    'name' => $role['name'],
                ],
            ],
        ]);
    }

    /**
     * Get realm roles assigned to a Keycloak user.
     */
    public function getUserRealmRoles(string $keycloakUserId): array
    {
        $token = $this->getAdminToken();

        $response = $this->httpClient->request('GET',
            "{$this->keycloakBaseUrl}/admin/realms/{$this->realm}/users/{$keycloakUserId}/role-mappings/realm",
            ['headers' => ['Authorization' => "Bearer {$token}"]]
        );

        return $response->getStatusCode() === 200 ? $response->toArray() : [];
    }
}
