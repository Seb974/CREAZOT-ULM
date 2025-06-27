<?php

namespace App\Service;

use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;
use App\Entity\Cadeau;
use App\Service\ClientGetter;

class PdfGenerator
{
    private Environment $twig;
    private ClientGetter $clientGetter;

    public function __construct(Environment $twig, ClientGetter $clientGetter)
    {
        $this->twig = $twig;
        $this->clientGetter = $clientGetter;
    }

    public function generate(Cadeau $data): string
    {
        $client = $this->clientGetter->get();
        $dompdf = new Dompdf();

        // Options
        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $dompdf->setOptions($options);

        // Rendu HTML
        $html = $this->twig->render('bon_cadeau/pdf.html.twig', [
            'cadeau' => $data,
            'encoded_image' => $this->getEncodedImage(),
            'client' => $client
        ]);

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Retourne le contenu binaire du PDF
        return $dompdf->output();
    }

    private function getEncodedImage()
    {
        $imagePath = __DIR__.'/../../public/images/Plane.png';

        $encodedImage = null;
        if (file_exists($imagePath)) {
            $imageData = file_get_contents($imagePath);
            $encodedImage = 'data:image/png;base64,' . base64_encode($imageData);
        }

        return $encodedImage;
    }
}
