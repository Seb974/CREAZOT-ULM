<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\SiteSettingsRepository;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OdooJsonRpcService
{
    private ?string $odooUrl = null;
    private ?string $odooDB = null;
    private ?string $odooLogin = null;
    private ?string $odooApiKey = null;
    private ?int $uid = null;
    private bool $resolved = false;

    public function __construct(
        private HttpClientInterface $httpClient,
        private SiteSettingsRepository $siteSettingsRepo,
        private LoggerInterface $logger,
    ) {}

    private function resolveConfig(): void
    {
        if ($this->resolved) {
            return;
        }

        $settings = $this->siteSettingsRepo->findInstance();

        if ($settings === null) {
            throw new \RuntimeException('SiteSettings introuvable — impossible de se connecter à Odoo.');
        }

        $this->odooUrl = $settings->getOdooUrl() ? rtrim($settings->getOdooUrl(), '/') : null;
        $this->odooDB = $settings->getOdooBdd();
        $this->odooLogin = $settings->getOdooUser();
        $this->odooApiKey = $settings->getOdooApiKey();

        if (!$this->odooUrl || !$this->odooDB || !$this->odooLogin || !$this->odooApiKey) {
            throw new \RuntimeException('Configuration Odoo incomplète dans SiteSettings. Renseignez URL, BDD, Utilisateur et Clé API.');
        }

        $this->resolved = true;
    }

    public function authenticate(): int
    {
        if ($this->uid !== null) {
            return $this->uid;
        }

        $this->resolveConfig();

        $payload = $this->buildPayload('common', 'login', [
            $this->odooDB,
            $this->odooLogin,
            $this->odooApiKey,
        ]);

        $response = $this->httpClient->request('POST', "{$this->odooUrl}/jsonrpc", [
            'json' => $payload,
        ]);

        $data = $response->toArray();

        if (isset($data['error'])) {
            $message = $data['error']['data']['message'] ?? $data['error']['message'] ?? 'Unknown error';
            $this->logger->error('Odoo authentication failed', ['error' => $message]);
            throw new \RuntimeException(sprintf('Odoo authentication failed: %s', $message));
        }

        $uid = $data['result'] ?? null;

        if (!is_int($uid) || $uid <= 0) {
            $this->logger->error('Odoo authentication returned invalid UID', ['result' => $uid]);
            throw new \RuntimeException('Odoo authentication failed: invalid UID returned');
        }

        $this->uid = $uid;
        $this->logger->info('Odoo authentication successful', ['uid' => $uid]);

        return $this->uid;
    }

    public function createPartner(array $data): int
    {
        $result = $this->execute('res.partner', 'create', [$data]);
        $partnerId = is_array($result) ? $result[0] : (int) $result;

        $this->logger->info('Odoo partner created', [
            'partner_id' => $partnerId,
            'name' => $data['name'] ?? null,
        ]);

        return $partnerId;
    }

    public function updatePartner(int $partnerId, array $data): bool
    {
        $result = $this->execute('res.partner', 'write', [[$partnerId], $data]);

        $this->logger->info('Odoo partner updated', [
            'partner_id' => $partnerId,
            'fields' => array_keys($data),
        ]);

        return (bool) $result;
    }

    public function createInvoice(int $partnerId, array $lines, ?int $paymentTermId = 2, ?string $ref = null): int
    {
        $invoiceData = [
            'partner_id' => $partnerId,
            'move_type' => 'out_invoice',
            'invoice_payment_term_id' => $paymentTermId,
            'ref' => $ref,
            'invoice_line_ids' => array_map(fn (array $line) => [0, 0, [
                'name' => $line['name'],
                'quantity' => $line['quantity'],
                'price_unit' => $line['price_unit'],
            ]], $lines),
        ];

        $result = $this->execute('account.move', 'create', [$invoiceData]);
        $invoiceId = is_array($result) ? $result[0] : (int) $result;

        $this->logger->info('Odoo invoice created', [
            'invoice_id' => $invoiceId,
            'partner_id' => $partnerId,
            'lines_count' => count($lines),
        ]);

        return $invoiceId;
    }

    public function validateInvoice(int $invoiceId): bool
    {
        $result = $this->execute('account.move', 'action_post', [[$invoiceId]]);

        $this->logger->info('Odoo invoice validated', ['invoice_id' => $invoiceId]);

        return (bool) $result;
    }

    public function sendInvoiceByEmail(int $invoiceId): bool
    {
        try {
            $result = $this->execute(
                'account.move',
                'action_send_and_print',
                [[$invoiceId]],
                ['compositing_mode' => 'comment_only'],
            );

            $this->logger->info('Odoo invoice sent by email', ['invoice_id' => $invoiceId]);

            return (bool) $result;
        } catch (\RuntimeException $e) {
            $this->logger->warning('action_send_and_print failed, trying action_invoice_sent', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage(),
            ]);

            $result = $this->execute('account.move', 'action_invoice_sent', [[$invoiceId]]);

            $this->logger->info('Odoo invoice sent by email (fallback)', ['invoice_id' => $invoiceId]);

            return (bool) $result;
        }
    }

    public function getInvoice(int $invoiceId): ?array
    {
        $fields = ['name', 'partner_id', 'amount_total', 'amount_residual', 'payment_state', 'state', 'invoice_date', 'invoice_date_due'];

        $result = $this->execute(
            'account.move',
            'search_read',
            [[['id', '=', $invoiceId]]],
            ['fields' => $fields, 'limit' => 1],
        );

        $this->logger->info('Odoo invoice fetched', ['invoice_id' => $invoiceId, 'found' => !empty($result)]);

        return $result[0] ?? null;
    }

    public function getOverdueInvoices(int $daysOverdue = 30): array
    {
        $cutoffDate = date('Y-m-d', strtotime("-{$daysOverdue} days"));
        $fields = ['name', 'partner_id', 'amount_total', 'amount_residual', 'payment_state', 'invoice_date_due'];

        $result = $this->execute(
            'account.move',
            'search_read',
            [[
                ['move_type', '=', 'out_invoice'],
                ['state', '=', 'posted'],
                ['payment_state', 'in', ['not_paid', 'partial']],
                ['invoice_date_due', '<', $cutoffDate],
            ]],
            ['fields' => $fields],
        );

        $this->logger->info('Odoo overdue invoices fetched', [
            'days_overdue' => $daysOverdue,
            'count' => count($result),
        ]);

        return $result;
    }

    public function getPartnerInvoices(int $partnerId): array
    {
        $fields = ['name', 'amount_total', 'amount_residual', 'payment_state', 'state', 'invoice_date', 'invoice_date_due'];

        $result = $this->execute(
            'account.move',
            'search_read',
            [[
                ['partner_id', '=', $partnerId],
                ['move_type', '=', 'out_invoice'],
            ]],
            ['fields' => $fields, 'order' => 'invoice_date desc'],
        );

        $this->logger->info('Odoo partner invoices fetched', [
            'partner_id' => $partnerId,
            'count' => count($result),
        ]);

        return $result;
    }

    public function createProduct(string $name, float $price, string $type = 'service'): int
    {
        $result = $this->execute('product.product', 'create', [[
            'name' => $name,
            'type' => $type,
            'list_price' => $price,
            'invoice_policy' => 'order',
        ]]);

        $productId = is_array($result) ? $result[0] : (int) $result;

        $this->logger->info('Odoo product created', [
            'product_id' => $productId,
            'name' => $name,
            'price' => $price,
        ]);

        return $productId;
    }


    /**
     * Teste la connexion Odoo avec des paramètres explicites (sans modifier l'état interne).
     * @return array{success: bool, message: string, uid?: int, version?: string}
     */
    public function testConnection(string $url, string $db, string $user, string $apiKey): array
    {
        $url = rtrim($url, '/');

        $authPayload = $this->buildPayload('common', 'authenticate', [$db, $user, $apiKey, []]);
        $response = $this->httpClient->request('POST', $url . '/jsonrpc', [
            'json' => $authPayload,
            'timeout' => 10,
        ]);
        $data = $response->toArray(false);

        if (isset($data['error'])) {
            $msg = $data['error']['data']['message'] ?? $data['error']['message'] ?? 'Erreur inconnue';
            return ['success' => false, 'message' => 'Authentification échouée : ' . $msg];
        }

        $uid = $data['result'] ?? null;
        if (!$uid || $uid === false) {
            return ["success" => false, "message" => "Identifiants incorrects. Vérifiez l'utilisateur et la clé API."];
        }

        $versionPayload = $this->buildPayload('common', 'version', []);
        $versionResponse = $this->httpClient->request('POST', $url . '/jsonrpc', [
            'json' => $versionPayload,
            'timeout' => 10,
        ]);
        $versionData = $versionResponse->toArray(false);
        $version = $versionData['result']['server_version'] ?? null;

        $message = sprintf('Connexion réussie ! (UID: %s', $uid);
        if ($version) {
            $message .= sprintf(', Odoo %s', $version);
        }
        $message .= ')';

        return ['success' => true, 'message' => $message, 'uid' => (int) $uid, 'version' => $version];
    }

    private function execute(string $model, string $method, array $args = [], array $kwargs = []): mixed
    {
        $uid = $this->authenticate();

        $payload = $this->buildPayload('object', 'execute_kw', [
            $this->odooDB,
            $uid,
            $this->odooApiKey,
            $model,
            $method,
            $args,
            $kwargs,
        ]);

        $response = $this->httpClient->request('POST', "{$this->odooUrl}/jsonrpc", [
            'json' => $payload,
        ]);

        $data = $response->toArray();

        if (isset($data['error'])) {
            $errorMessage = $data['error']['data']['message'] ?? $data['error']['message'] ?? 'Unknown JSON-RPC error';
            $this->logger->error('Odoo JSON-RPC error', [
                'model' => $model,
                'method' => $method,
                'error' => $errorMessage,
            ]);
            throw new \RuntimeException(sprintf('Odoo execute error on %s.%s: %s', $model, $method, $errorMessage));
        }

        return $data['result'];
    }

    private function buildPayload(string $service, string $method, array $args): array
    {
        return [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'id' => random_int(1, 999999),
            'params' => [
                'service' => $service,
                'method' => $method,
                'args' => $args,
            ],
        ];
    }
}
