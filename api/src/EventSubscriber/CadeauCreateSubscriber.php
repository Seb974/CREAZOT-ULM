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

class CadeauCreateSubscriber implements EventSubscriberInterface
{
    private PdfGenerator $pdfGenerator;
    private MailerInterface $mailer;
    private Environment $twig;

    public function __construct(PdfGenerator $pdfGenerator, MailerInterface $mailer, Environment $twig)
    {
        $this->pdfGenerator = $pdfGenerator;
        $this->mailer = $mailer;
        $this->twig = $twig;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['onCadeauCreated', EventPriorities::PRE_WRITE],
        ];
    }

    public function onCadeauCreated(ViewEvent $event): void
    {
        $cadeau = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$cadeau instanceof Cadeau || ($method !== 'POST' && $method !== 'PUT')) {
            return;
        }

        if (!is_null($cadeau->isSendEmail()) && $cadeau->isSendEmail()) {
            $pdfContent = $this->pdfGenerator->generate($cadeau);
            $email = (new Email())
                ->from('contact@planetair974.com')
                ->to($cadeau->getEmail())
                ->bcc('planetair974@gmail.com')
                ->subject('Votre bon cadeau')
                ->html($this->twig->render('emails/cadeau.html.twig', ['cadeau' => $cadeau]))
                ->attach($pdfContent, 'bon-cadeau.pdf', 'application/pdf');
    
            $this->mailer->send($email);
            $cadeau->setSendEmail(false);
        }
    }
}
