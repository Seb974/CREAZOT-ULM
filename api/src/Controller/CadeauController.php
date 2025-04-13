<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Cadeau;
use App\Service\PdfGenerator;
use ApiPlatform\Api\IriConverterInterface;

class CadeauController extends AbstractController
{
    #[Route('/admin/bons-cadeaux/{id}/download', name: 'cadeau_download', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function downloadPdf(Cadeau $cadeau, PdfGenerator $pdfGenerator): Response
    {

        if (!$cadeau instanceof Cadeau) {
            throw $this->createNotFoundException('Bon cadeau introuvable.');
        }

        // Génération du contenu PDF
        $pdfContent = $pdfGenerator->generate($cadeau);

        return new Response(
            $pdfContent,
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="bon-cadeau-' . $cadeau->getId() . '.pdf"',
            ]
        );
    }
}