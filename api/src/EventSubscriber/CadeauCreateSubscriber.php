<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Cadeau;
use App\Service\PdfGenerator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use App\Service\ClientGetter;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\DynamicMailerFactory;

class CadeauCreateSubscriber implements EventSubscriberInterface
{
    private Environment $twig;
    private PdfGenerator $pdfGenerator;
    private ClientGetter $clientGetter;
    private EntityManagerInterface $entityManager;
    private DynamicMailerFactory $dynamicMailerFactory;

    public function __construct(PdfGenerator $pdfGenerator, DynamicMailerFactory $dynamicMailerFactory, Environment $twig, EntityManagerInterface $entityManager, ClientGetter $clientGetter)
    {
        $this->twig = $twig;
        $this->clientGetter = $clientGetter;
        $this->pdfGenerator = $pdfGenerator;
        $this->entityManager = $entityManager;
        $this->dynamicMailerFactory = $dynamicMailerFactory;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['onCadeauCreated', EventPriorities::POST_WRITE],
        ];
    }

    public function onCadeauCreated(ViewEvent $event): void
    {
        $cadeau = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();
        $client = $this->clientGetter->get();

        if (!$cadeau instanceof Cadeau || !in_array($method, ['POST', 'PUT']) || !$cadeau->getEmail() || 
            !$client->getEmail() || !$client->getEmailServer() || !$client->getEmailAddressSender()) 
        {
            return;
        }

        if (!is_null($cadeau->isSendEmail()) && $cadeau->isSendEmail()) {
            try {
                
                $pdfContent = $this->pdfGenerator->generate($cadeau);
                $mailer = $this->dynamicMailerFactory->getMailerForUniqueClient();
                $email = (new Email())
                    ->from($client->getEmailAddressSender())
                    ->to($cadeau->getEmail())
                    ->bcc($client->getEmail())
                    ->subject('Un vol magique vous attend dans ce bon cadeau 🎁🌤️')
                    ->html($this->twig->render('emails/cadeau.html.twig', ['cadeau' => $cadeau, 'client' => $client]))
                    ->attach($pdfContent, 'bon-cadeau.pdf', 'application/pdf');
        
                $mailer->send($email);
                $cadeau->setSendEmail(false);
                $this->entityManager->flush();
            } catch (\Throwable $e) {
                return;
            }
        }
    }
}
