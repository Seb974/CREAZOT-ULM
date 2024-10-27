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

final class PassagerEmailSubscriber implements EventSubscriberInterface
{
    private $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
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

        if (!$passager instanceof Passager || Request::METHOD_POST !== $method) {
            return;
        }

        $message = (new TemplatedEmail())
            ->from('sebastien.maillot@gmx.fr')
            ->to($passager->getEmail())
            ->subject('Planetair974 : Photos & vidéos')
            ->htmlTemplate('emails/link.html.twig')
            ->context([
                'user' => $passager->getPrenom(),
            ]);

        $this->mailer->send($message);
    }
}