<?php

namespace App\Service;

use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;
use App\Entity\Cadeau;
use App\Entity\Client;
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
        $client = $data->getClient() ?? $this->clientGetter->get();
        $dompdf = new Dompdf();

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $dompdf->setOptions($options);

        $html = $this->twig->render('bon_cadeau/pdf.html.twig', [
            'cadeau' => $data,
            'encoded_image' => $this->getEncodedImage($client),
            'client' => $client
        ]);

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    private function getEncodedImage(?Client $client = null): ?string
    {
        $imagePath = null;

        if ($client && $client->getPdfBackground()) {
            $candidatePath = __DIR__ . '/../../public' . $client->getPdfBackground();
            if (file_exists($candidatePath)) {
                $imagePath = $candidatePath;
            }
        }

        if (!$imagePath) {
            $imagePath = __DIR__ . '/../../public/images/Plane.png';
        }

        if (file_exists($imagePath)) {
            return 'data:image/png;base64,' . base64_encode(file_get_contents($imagePath));
        }

        return null;
    }
}
