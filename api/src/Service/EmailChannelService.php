<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EmailChannelService
{
    public function __construct(
        private ReservationAiService $aiService,
        private ConversationManager $conversationManager,
        private MailerInterface $mailer,
        private LoggerInterface $logger,
    ) {}

    public function pollInbox(Client $client): int
    {
        $imapDsn = $client->getAiReservationImapDsn();
        $imapUser = $client->getAiReservationImapUser();
        $imapPassword = $client->getAiReservationImapPassword();

        if (!$imapDsn || !$imapUser || !$imapPassword) {
            $this->logger->debug('IMAP config missing for client {name}', ['name' => $client->getName()]);
            return 0;
        }

        $mailbox = @imap_open($imapDsn, $imapUser, $imapPassword);
        if (!$mailbox) {
            $this->logger->error('IMAP connection failed for client {name}: {error}', [
                'name' => $client->getName(),
                'error' => imap_last_error() ?: 'unknown',
            ]);
            return 0;
        }

        $processed = 0;

        try {
            $emails = imap_search($mailbox, 'UNSEEN');
            if (!$emails) {
                return 0;
            }

            foreach ($emails as $emailNumber) {
                try {
                    $processed += $this->processEmail($mailbox, $emailNumber, $client);
                } catch (\Throwable $e) {
                    $this->logger->error('Failed to process email #{num} for client {name}: {error}', [
                        'num' => $emailNumber,
                        'name' => $client->getName(),
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } finally {
            imap_close($mailbox);
        }

        return $processed;
    }

    private function processEmail($mailbox, int $emailNumber, Client $client): int
    {
        $header = imap_headerinfo($mailbox, $emailNumber);
        if (!$header) {
            return 0;
        }

        $fromAddress = $header->from[0]->mailbox . '@' . $header->from[0]->host;
        $fromName = isset($header->from[0]->personal) ? imap_utf8($header->from[0]->personal) : null;
        $subject = isset($header->subject) ? imap_utf8($header->subject) : '';
        $messageId = $header->message_id ?? null;

        $body = $this->extractPlainText($mailbox, $emailNumber);
        if (!$body) {
            $this->logger->warning('Empty body for email from {from}', ['from' => $fromAddress]);
            return 0;
        }

        $thread = $this->conversationManager->findOrCreateThread('email', $client, $fromAddress, null, $fromName);

        if ($messageId) {
            $thread->setExternalConversationId($messageId);
        }

        $response = $this->aiService->processMessage($thread, $body);

        $this->sendResponse($client, $fromAddress, $subject, $response, $messageId);

        imap_setflag_full($mailbox, (string) $emailNumber, '\\Seen');

        $this->logger->info('Processed email from {from} for client {client} → thread #{id}', [
            'from' => $fromAddress,
            'client' => $client->getName(),
            'id' => $thread->getId(),
        ]);

        return 1;
    }

    public function sendResponse(Client $client, string $toEmail, string $originalSubject, string $responseBody, ?string $inReplyTo = null): void
    {
        $senderEmail = $client->getAiReservationEmail() ?? $client->getEmailAddressSender();
        if (!$senderEmail) {
            $this->logger->warning('No sender email for client {name}, cannot send response', ['name' => $client->getName()]);
            return;
        }

        $subject = $originalSubject;
        if ($subject && !str_starts_with(strtolower($subject), 're:')) {
            $subject = 'Re: ' . $subject;
        }
        if (!$subject) {
            $subject = 'Votre demande de réservation — ' . $client->getName();
        }

        $signature = "\n\n---\n{$client->getName()} — Assistant de réservation\nCe message a été généré par notre assistant IA.";

        $email = (new Email())
            ->from($senderEmail)
            ->to($toEmail)
            ->subject($subject)
            ->text($responseBody . $signature);

        if ($inReplyTo) {
            $email->getHeaders()->addTextHeader('In-Reply-To', $inReplyTo);
            $email->getHeaders()->addTextHeader('References', $inReplyTo);
        }

        try {
            $this->mailer->send($email);
            $this->logger->info('Response sent to {to}', ['to' => $toEmail]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send email to {to}: {error}', [
                'to' => $toEmail,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function extractPlainText($mailbox, int $msgNumber): string
    {
        $structure = imap_fetchstructure($mailbox, $msgNumber);
        if (!$structure) {
            return '';
        }

        if (empty($structure->parts)) {
            $body = imap_fetchbody($mailbox, $msgNumber, '1');
            return $this->decodeBody($body, $structure->encoding ?? 0);
        }

        foreach ($structure->parts as $partIndex => $part) {
            if ($part->subtype === 'PLAIN') {
                $body = imap_fetchbody($mailbox, $msgNumber, (string) ($partIndex + 1));
                return $this->decodeBody($body, $part->encoding ?? 0);
            }
        }

        foreach ($structure->parts as $partIndex => $part) {
            if ($part->subtype === 'HTML') {
                $body = imap_fetchbody($mailbox, $msgNumber, (string) ($partIndex + 1));
                $decoded = $this->decodeBody($body, $part->encoding ?? 0);
                return strip_tags($decoded);
            }
        }

        $body = imap_fetchbody($mailbox, $msgNumber, '1');
        return $this->decodeBody($body, $structure->encoding ?? 0);
    }

    private function decodeBody(string $body, int $encoding): string
    {
        return match ($encoding) {
            3 => base64_decode($body),
            4 => quoted_printable_decode($body),
            default => $body,
        };
    }
}
