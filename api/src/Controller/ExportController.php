<?php

namespace App\Controller;

use App\Entity\Vol;
use App\Entity\Aeronef;
use App\Entity\Entretien;
use App\Entity\Prestation;
use App\Entity\Landing;
use App\Entity\Airport;
use App\Entity\Camera;
use App\Entity\Cadeau;
use App\Entity\Expense;
use App\Entity\Circuit;
use App\Entity\Origine;
use App\Entity\Payment;
use App\Entity\CarnetVol;
use App\Entity\Passager;
use App\Entity\Reservation;
use App\Entity\ProfilPilote;
use App\Entity\Disponibilite;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\Export\ExportFilterManager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Dompdf\Dompdf;
use Doctrine\ORM\QueryBuilder;

class ExportController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em, private ExportFilterManager $exportFilterManager) {}

    #[Route('/exports/{entity}', name: 'export_generic', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportAeronefs(Request $request, string $entity): Response
    {
        $map = [
            'aeronefs'      => Aeronef::class,
            'circuits'      => Circuit::class,
            'origines'      => Origine::class,
            'profil_pilotes'=> ProfilPilote::class,
            'entretiens'    => Entretien::class,
            'reservations'  => Reservation::class,
            'cadeaux'       => Cadeau::class,
            'passagers'     => Passager::class,
            'carnet_vols'   => CarnetVol::class,
            'prestations'   => Prestation::class,
            'vols'          => Vol::class,
            'payments'      => Payment::class,
            'landings'      => Landing::class,
            'disponibilites'=> Disponibilite::class,
            'airports'      => Airport::class,
            'cameras'       => Camera::class,
            'expenses'      => Expense::class,
        ];

        if (!isset($map[$entity]))
            throw $this->createNotFoundException("Export impossible pour '$entity'");

        return $this->handleExport($request, $map[$entity], $entity);
    }

    private function handleExport(Request $request, string $entityClass, string $filenameBase): Response
    {
        $format = strtolower($request->query->get('format', 'csv'));
        $results = $this->exportFilterManager->getResults($entityClass, $request);
        [$headers, $rows] = $this->exportFilterManager->formatExport($entityClass, $results, $format);

        return $this->export($request, $headers, $rows, $filenameBase);
    }

    private function export(Request $request, array $headers, array $rows, string $filenameBase): Response
    {
        $format = strtolower($request->query->get('format', 'csv'));

        $contentType = $format === 'pdf' ? 'application/pdf' : 'text/csv';
        $filename = $format === 'pdf' ? "$filenameBase.pdf" : "$filenameBase.csv";
        
        $content = $format === 'pdf' ? $this->getPdfFormat($headers, $rows) : $this->getCsvFormat($headers, $rows);
        
        $response = new Response($content);
        $response->headers->set('Content-Type', $contentType);
        $response->headers->set('Content-Disposition', "attachment; filename=\"$filename\"");

        return $response;
    }

    private function getCsvFormat(array $headers, array $rows)
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        foreach ($rows as $row) fputcsv($handle, $row);
        rewind($handle);

        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return $csvContent;
    }

    private function getPdfFormat(array $headers, array $rows) 
    {
        $html = '
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                    font-size: 9pt;
                    word-wrap: break-word;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 4px;
                    text-align: left;
                }
                thead {
                    background-color: #f2f2f2;
                }
                a {
                    color: #1a0dab;
                    text-decoration: underline;
                }
            </style>
            <table>
                <thead><tr>';

        foreach ($headers as $header) {
            $html .= "<th>{$header}</th>";
        }

        $html .= '</tr></thead><tbody>';

        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= "<td>{$cell}</td>";
            }
            $html .= '</tr>';
        }
        
        $html .= '</tbody></table>';

        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape'); 
        $dompdf->render();

        return $dompdf->output();
    }
}
