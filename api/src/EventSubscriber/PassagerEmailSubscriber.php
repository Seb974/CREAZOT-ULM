<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Passager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use App\Service\DynamicMailerFactory;
use App\Service\ClientGetter;

final class PassagerEmailSubscriber implements EventSubscriberInterface
{
    private DynamicMailerFactory $dynamicMailerFactory;
    private ClientGetter $clientGetter;

    public function __construct(DynamicMailerFactory $dynamicMailerFactory, ClientGetter $clientGetter)
    {
        $this->dynamicMailerFactory = $dynamicMailerFactory;
        $this->clientGetter = $clientGetter;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::VIEW => ['sendMail', EventPriorities::POST_WRITE],
        ];
    }

    public function sendMail(ViewEvent $event): void
    {   
        $passager = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();
        $client = $this->clientGetter->get();

        if (!$passager instanceof Passager || Request::METHOD_POST !== $method || !$passager->getEmail() || !$client->getEmailServer() || 
            !$client->getEmailAddressSender() || !$client->hasEmailConfirmation() || empty($client->getConfirmationMessage())) 
        {
            return;
        }

        try {
            $subject = empty($client->getConfirmationSubject()) ? '' : $client->getConfirmationSubject();
            $bodyHtml = str_replace('{{FIRSTNAME}}', $passager->getPrenom(), $client->getConfirmationMessage());

            $mailer = $this->dynamicMailerFactory->getMailerForUniqueClient();
            $message = (new Email())
                ->from($client->getEmailAddressSender())
                ->to($passager->getEmail())
                ->subject($subject)
                ->html($bodyHtml);
    
            $mailer->send($message);
        } catch (\Throwable $e) {
            return;
        }
    }
}