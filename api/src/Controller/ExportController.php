<?php

namespace App\Controller;

use App\Entity\Vol;
use App\Entity\Aeronef;
use App\Entity\Entretien;
use App\Entity\Prestation;
use App\Entity\Landing;
use App\Entity\Cadeau;
use App\Entity\Circuit;
use App\Entity\Origine;
use App\Entity\Payment;
use App\Entity\CarnetVol;
use App\Entity\Passager;
use App\Entity\Reservation;
use App\Entity\ProfilPilote;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Dompdf\Dompdf;
use Doctrine\ORM\QueryBuilder;

class ExportController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    private function getFilteredResults(string $entityClass, Request $request): array
    {
        $params = $request->query->all();

        // --- Landing ---
        if ($entityClass === Landing::class) {
            $qb = $this->em->getRepository(Landing::class)->createQueryBuilder('l')
                ->join('l.vol', 'v')
                ->join('v.prestation', 'p')
                ->leftJoin('p.aeronef', 'aer')
                ->leftJoin('p.pilote', 'pil');

            if (!empty($params['airport'])) {
                $qb->andWhere(
                    $qb->expr()->orX(
                        'l.airportCode LIKE :airport',
                        'l.airportName LIKE :airport'
                    )
                )->setParameter('airport', "%{$params['airport']}%");
            }

            // Aeronef
            $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
            if (!empty($aer)) {
                $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                    ->setParameter('imm', "%$aer%");
            }

            // Pilote
            $pil = $params['pilote'] ?? ($params['pilote_firstName'] ?? null);
            if (!empty($pil)) {
                $qb->andWhere('COALESCE(pil.firstName, \'\') LIKE :pil')
                    ->setParameter('pil', "%$pil%");
            }

            // Date
            if (!empty($params['date']) && is_array($params['date'])) {
                if (!empty($params['date']['after'])) {
                    $qb->andWhere('p.date >= :after')
                    ->setParameter('after', new \DateTimeImmutable($params['date']['after']));
                }
                if (!empty($params['date']['before'])) {
                    $qb->andWhere('p.date <= :before')
                    ->setParameter('before', new \DateTimeImmutable($params['date']['before']));
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- Prestation ---
        if ($entityClass === Prestation::class) {
            $qb = $this->em->getRepository(Prestation::class)->createQueryBuilder('p')
                ->leftJoin('p.aeronef', 'aer')
                ->leftJoin('p.pilote', 'pil');

            // Aeronef
            $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
            if (!empty($aer)) {
                $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                    ->setParameter('imm', "%$aer%");
            }

            // Pilote
            $pil = $params['pilote'] ?? ($params['pilote_firstName'] ?? null);
            if (!empty($pil)) {
                $qb->andWhere('LOWER(COALESCE(pil.firstName, \'\')) LIKE :pil')
                    ->setParameter('pil', '%' . strtolower($pil) . '%');
            }

            // Date
            if (!empty($params['date']) && is_array($params['date'])) {
                if (!empty($params['date']['after'])) {
                    $qb->andWhere('p.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
                }
                if (!empty($params['date']['before'])) {
                    $qb->andWhere('p.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- Vol ---
        if ($entityClass === Vol::class) {
            $qb = $this->em->getRepository(Vol::class)->createQueryBuilder('v')
                ->leftJoin('v.circuit', 'circuit')
                ->leftJoin('v.prestation', 'prestation')
                ->leftJoin('prestation.pilote', 'pilote')
                ->leftJoin('prestation.aeronef', 'aeronef')
                ->addSelect('circuit', 'prestation', 'pilote', 'aeronef');

            foreach ($params as $key => $value) {
                if (empty($value) && $value !== '0') continue;

                switch ($key) {
                    case 'aeronef':
                    case 'prestation_aeronef':
                    case 'aeronef_immatriculation':
                    case 'prestation_aeronef_immatriculation':
                        $qb->andWhere('LOWER(aeronef.immatriculation) LIKE :immatriculation')
                            ->setParameter('immatriculation', '%' . strtolower($value) . '%');
                        break;
                    case 'pilote':
                    case 'prestation_pilote':
                    case 'pilote_firstName':
                    case 'prestation_pilote_firstName':
                        $qb->andWhere('LOWER(pilote.firstName) LIKE :name')
                            ->setParameter('name', '%' . strtolower($value) . '%');
                        break;
                    case 'circuit':
                    case 'circuit_code':
                        $qb->andWhere('circuit.code LIKE :circuitCode')
                        ->setParameter('circuitCode', "%$value");
                        break;

                    case 'date':
                    case 'prestation_date':
                        if (!empty($value['after'])) {
                            $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                            $qb->andWhere('prestation.date >= :after')->setParameter('after', $after);
                        }
                        if (!empty($value['before'])) {
                            $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                            $qb->andWhere('prestation.date <= :before')->setParameter('before', $before);
                        }
                        break;
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- Entretien ---
        if ($entityClass === Entretien::class) {
            $qb = $this->em->getRepository(Entretien::class)->createQueryBuilder('e')
                ->leftJoin('e.aeronef', 'aer');

            // Aeronef
            $aer = $params['aeronef'] ?? ($params['aeronef_immatriculation'] ?? null);
            if (!empty($aer)) {
                $qb->andWhere('COALESCE(aer.immatriculation, \'\') LIKE :imm')
                    ->setParameter('imm', "%$aer%");
            }

            // Changement moteur
            if (isset($params['changementMoteur'])) {
                $bool = filter_var($params['changementMoteur'], FILTER_VALIDATE_BOOLEAN);
                $qb->andWhere('e.changementMoteur = :cm')->setParameter('cm', $bool);
            }

            // Date
            if (!empty($params['date']) && is_array($params['date'])) {
                if (!empty($params['date']['after'])) {
                    $qb->andWhere('e.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
                }
                if (!empty($params['date']['before'])) {
                    $qb->andWhere('e.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- Passager ---
        if ($entityClass === Passager::class) {
            $qb = $this->em->getRepository(Passager::class)->createQueryBuilder('pa');
            if (!empty($params['date']) && is_array($params['date'])) {
                if (!empty($params['date']['after'])) {
                    $qb->andWhere('pa.date >= :after')->setParameter('after', new \DateTimeImmutable($params['date']['after']));
                }
                if (!empty($params['date']['before'])) {
                    $qb->andWhere('pa.date <= :before')->setParameter('before', new \DateTimeImmutable($params['date']['before']));
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- CarnetVol ---
        if ($entityClass === CarnetVol::class) {
            $qb = $this->em->getRepository(CarnetVol::class)->createQueryBuilder('c');

            if (!empty($params['date']) && is_array($params['date'])) {
                if (!empty($params['date']['after'])) {
                    $after = \DateTimeImmutable::createFromFormat('d/m/Y', $params['date']['after']);
                    if (!$after) {
                        $after = new \DateTimeImmutable($params['date']['after']); // fallback
                    }
                    $qb->andWhere('c.date >= :after')->setParameter('after', $after);
                }
                if (!empty($params['date']['before'])) {
                    $before = \DateTimeImmutable::createFromFormat('d/m/Y', $params['date']['before']);
                    if (!$before) {
                        $before = new \DateTimeImmutable($params['date']['before']); // fallback
                    }
                    $qb->andWhere('c.date <= :before')->setParameter('before', $before);
                }
            }
            return $qb->getQuery()->getResult();
        }

        // --- Reservation ---
        if ($entityClass === Reservation::class) {
            $qb = $this->em->getRepository(Reservation::class)->createQueryBuilder('r')
                ->leftJoin('r.circuit', 'circuit')
                ->leftJoin('r.option', 'opt')
                ->leftJoin('r.pilote', 'pil')
                ->leftJoin('r.avion', 'aer')
                ->leftJoin('r.cadeau', 'cadeau')
                ->leftJoin('r.origine', 'origine')
                ->leftJoin('r.contact', 'contact')
                ->addSelect('circuit', 'opt', 'pil', 'aer', 'cadeau', 'origine', 'contact');

            foreach ($params as $key => $value) {
                if (empty($value) && $value !== '0') continue;

                switch ($key) {
                    case 'nom':
                        $qb->andWhere('LOWER(r.nom) LIKE :nom')
                            ->setParameter('nom', '%' . strtolower($value) . '%');
                        break;

                    case 'circuit':
                    case 'circuit_code':
                        $qb->andWhere('circuit.code LIKE :circuitCode')
                        ->setParameter('circuitCode', "%$value%");
                        break;

                    case 'debut':
                        if (!empty($value['after'])) {
                            $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                            $qb->andWhere('r.debut >= :after')->setParameter('after', $after);
                        }
                        if (!empty($value['before'])) {
                            $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                            $qb->andWhere('r.debut <= :before')->setParameter('before', $before);
                        }
                        break;
                }
            }
            return $results = $qb->getQuery()->getResult();
        }

        // --- Cadeaux ---
        if ($entityClass === Cadeau::class) {
            $qb = $this->em->getRepository(Cadeau::class)->createQueryBuilder('c')
                ->leftJoin('c.circuit', 'circuit')
                ->leftJoin('c.options', 'opt')
                ->leftJoin('c.origine', 'origine')
                ->addSelect('circuit', 'opt', 'origine');

            foreach ($params as $key => $value) {
                if (empty($value) && $value !== '0') continue;

                switch ($key) {
                    case 'beneficiaire':
                        $qb->andWhere('LOWER(c.beneficiaire) LIKE :beneficiaire')
                            ->setParameter('beneficiaire', '%' . strtolower($value) . '%');
                        break;
                    case 'offreur':
                        $qb->andWhere('LOWER(c.offreur) LIKE :offreur')
                            ->setParameter('offreur', '%' . strtolower($value) . '%');
                        break;
                    case 'circuit':
                    case 'circuit_code':
                        $qb->andWhere('circuit.code LIKE :circuitCode')
                        ->setParameter('circuitCode', "%$value%");
                        break;

                    case 'fin':
                        if (!empty($value['after'])) {
                            $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                            $qb->andWhere('c.fin >= :after')->setParameter('after', $after);
                        }
                        if (!empty($value['before'])) {
                            $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                            $qb->andWhere('c.fin <= :before')->setParameter('before', $before);
                        }
                        break;
                    case 'used':
                        $bool = filter_var($params['used'], FILTER_VALIDATE_BOOLEAN);
                        $qb->andWhere('c.used = :used')
                            ->setParameter('used', $bool);
                }
            }
            return $results = $qb->getQuery()->getResult();
        }

        // --- Payment ---
        if ($entityClass === Payment::class) {
            $qb = $this->em->getRepository(Payment::class)->createQueryBuilder('p')
                ->leftJoin('p.details', 'details')
                ->leftJoin('details.prepayment', 'prepayment');

            foreach ($params as $key => $value) {
                if (empty($value) && $value !== '0') continue;

                switch ($key) {
                    case 'intitule':
                        $qb->andWhere('LOWER(p.name) LIKE :intitule')
                            ->setParameter('intitule', '%' . strtolower($value) . '%');
                        break;
                    case 'mode':
                    case 'details_mode':
                        $qb->andWhere('LOWER(details.mode) LIKE :mode')
                            ->setParameter('mode', '%' . strtolower($value) . '%');
                        break;
                    case 'date':
                        if (!empty($value['after'])) {
                            $after = \DateTimeImmutable::createFromFormat('d/m/Y', $value['after']) ?: new \DateTimeImmutable($value['after']);
                            $qb->andWhere('p.date >= :after')->setParameter('after', $after);
                        }
                        if (!empty($value['before'])) {
                            $before = \DateTimeImmutable::createFromFormat('d/m/Y', $value['before']) ?: new \DateTimeImmutable($value['before']);
                            $qb->andWhere('p.date <= :before')->setParameter('before', $before);
                        }
                        break;
                }
            }
            return $results = $qb->getQuery()->getResult();
        }
        return [];
    }

    /**
     * Export CSV ou PDF
     */
    private function export(Request $request, array $headers, array $rows, string $filenameBase): Response
    {
        $format = strtolower($request->query->get('format', 'csv'));

        if ($format === 'pdf') {
            $html = '<table border="1" cellpadding="5"><thead><tr>';
            foreach ($headers as $header) $html .= "<th>{$header}</th>";
            $html .= '</tr></thead><tbody>';
            foreach ($rows as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) $html .= "<td>{$cell}</td>";
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';

            $dompdf = new Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();

            $response = new Response($dompdf->output());
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', "attachment; filename=\"$filenameBase.pdf\"");
            return $response;
        }

        // CSV
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        foreach ($rows as $row) fputcsv($handle, $row);
        rewind($handle);

        $response = new Response(stream_get_contents($handle));
        fclose($handle);
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', "attachment; filename=\"$filenameBase.csv\"");

        return $response;
}

    #[Route('/exports/aeronefs', name: 'export_aeronefs', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportAeronefs(Request $request): Response
    {
        $aeronefs = $this->em->getRepository(Aeronef::class)->findAll();
        $headers = ['Id', 'Immatriculation', 'Horamètre', 'Code Balise', 'Affichage décimal', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Aeronef $a) => [
            $a->getId(),
            $a->getImmatriculation(),
            $a->getHorametre(),
            $a->getCodeBalise(),
            $a->isDecimal() ? 'Oui' : 'Non',
            $a->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getCreatedBy()?->getFirstName(),
            $a->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $a->getUpdatedBy()?->getFirstName()
        ], $aeronefs);

        return $this->export($request, $headers, $rows, 'aeronefs');
    }

    #[Route('/exports/circuits', name: 'export_circuits', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportCircuits(Request $request): Response
    {
        $circuits = $this->em->getRepository(Circuit::class)->findAll();
        $headers = ['Id', 'Code', 'Nom', 'Code e-commerce', 'Type de vol', 'Durée', 'Prix Fixe', 
        'Prix', 'Coût',  'Option(s) possible(s)', 'Qualification(s) nécessaire(s)', 
        'Encadrant nécessaire', 'Déclaration des atterrissages', 'Atterrissage par défaut'];

        $rows = array_map(fn(Circuit $c) => [
            $c->getId() ?? '',
            $c->getCode() ?? '',
            $c->getNom() ?? '',
            $c->getWebshopId() ?? '',
            $c->getNature()?->getLabel() ?? '',
            $c->getDuree()?->format('H:i') ?? '',
            $c->isPrixFixe() ? 'Oui' : 'Non',
            $c->getPrix() ?? '',
            $c->getCout() ?? '',
            $c->isAvecOptions() ? 'Oui' : 'Non',
            implode(', ', array_map(fn($q) => $q->getNom(), $c->getQualifications()->toArray())),
            $c->isNeedsEncadrant() ? 'Oui' : 'Non',
            $c->isRequireLandingDeclaration() ? 'Oui' : 'Non',
            $c->isHadDefaultLanding() ? 'Oui' : 'Non'
        ], $circuits);

        return $this->export($request, $headers, $rows, 'circuits');
    }

    #[Route('/exports/origines', name: 'export_origines', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportOrigines(Request $request): Response
    {
        $origines = $this->em->getRepository(Origine::class)->findAll();
        $headers = ['Id', 'Nom', 'Remise'];

        $rows = array_map(fn(Origine $c) => [
            $c->getId() ?? '',
            $c->getName() ?? '',
            $c->getDiscount() ?? 0 . '%'
        ], $origines);

        return $this->export($request, $headers, $rows, 'origines');
    }

    #[Route('/exports/profil_pilotes', name: 'export_profil_pilotes', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportProfilPilotes(Request $request): Response
    {
        $profils = $this->em->getRepository(ProfilPilote::class)->findAll();
        $headers = ['Id', 'Nom', 'E-mail', 'Heures de vol', 'Certificat Médical', 'Obtention', 'Fin de validité', 'Médecin',
        'Qualification', 'Obtention', 'Fin de validité', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = [];

        foreach ($profils as $profil) {
            $pilote = $profil->getPilote();
            $certificatMedical = $profil->getCertificatMedical();
            $qualifications = $profil->getPilotQualifications();
            $first = true;

            if (count($qualifications ) > 0) {
                foreach ($qualifications as $q) { 
                    $rows[] = [
                        $first ? $profil->getId() ?? '' : '',
                        $first ? $pilote?->getFirstName() ?? '' : '',
                        $first ? $pilote?->getEmail() ?? '' : '',
                        $first ? $profil?->getTotalFlightHours() ?? '' : '',
                        $first ? $this->getCertificatName($certificatMedical?->getType()) ?? '' : '',
                        $first ? $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '' : '',
                        $first ? $this->getValidity($certificatMedical?->getValidUntil()) ?? '' : '',
                        $first ? $certificatMedical?->getMedecin() ?? '' : '',
                        $q->getQualification()?->getNom() ?? '',
                        $q->getDateObtention()?->format('Y-m-d') ?? '',
                        $this->getValidity($q->getValidUntil()) ?? '',
                        $first ? $profil->getCreatedAt()?->format('Y-m-d H:i') ?? '' : '',
                        $first ? $profil->getCreatedBy()?->getFirstName() ?? '' : '',
                        $first ? $profil->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '',
                        $first ? $profil->getUpdatedBy()?->getFirstName() ?? '' : ''
                    ];
    
                    $first = false;
                }
            } else {
                $rows[] = [
                    $profil->getId() ?? '',
                    $pilote?->getFirstName() ?? '',
                    $pilote?->getEmail() ?? '',
                    $profil?->getTotalFlightHours() ?? '',
                    $this->getCertificatName($certificatMedical?->getType()) ?? '',
                    $certificatMedical?->getDateObtention()?->format('Y-m-d') ?? '',
                    $this->getValidity($certificatMedical?->getValidUntil()) ?? '',
                    $certificatMedical?->getMedecin() ?? '',
                    '',
                    '',
                    '',
                    $profil->getCreatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getCreatedBy()?->getFirstName() ?? '',
                    $profil->getUpdatedAt()?->format('Y-m-d H:i') ?? '',
                    $profil->getUpdatedBy()?->getFirstName() ?? ''
                ];
            }
        }
        return $this->export($request, $headers, $rows, 'profil_pilotes');
    }

    #[Route('/exports/entretiens', name: 'export_entretiens', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportEntretiens(Request $request): Response
    {
        $results = $this->getFilteredResults(Entretien::class, $request);

        $headers = ['Id', 'Date', 'Aéronef', 'Horamètre intervention', 'Intervention', 'Changement Moteur', 'Intervenants', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(Entretien $e) => [
            $e->getId(),
            $e->getDate()?->format('Y-m-d') ?? '',
            $e->getAeronef()?->getImmatriculation(),
            $e->getHorametreIntervention(),
            $e->getIntervention(),
            $e->isChangementMoteur(),
            implode(', ', array_map(fn($u) => $u->getFirstName(), $e->getIntervenants()->toArray())),
            $e->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getCreatedBy()?->getFirstName() ?? '',
            $e->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $e->getUpdatedBy()?->getFirstName() ?? ''
        ], $results);

        return $this->export($request, $headers, $rows, 'entretiens');
    }

    #[Route('/exports/reservations', name: 'export_reservations', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportReservations(Request $request): Response
    {
        $results = $this->getFilteredResults(Reservation::class, $request);

        $headers = ['Id', 'Code', 'Reference du paiement', 'Debut', 'Fin', 'Nom', 'Telephone',
        'Email', 'Quantite', 'Circuit', 'Option', 'Prix', 'Pilote', 'Aeronef', 'Report', 'Paye',
        'Upsell', 'Origine', 'Contact', 'Code cadeau', 'Beneficiaire cadeau', 'Offreur cadeau',
        'N° de paiement du cadeau'];

        $rows = array_map(fn(Reservation $r) => [
            $r->getId(),
            $r->getCode(),
            $r->getPaymentReference(),
            $r->getDebut()?->format('Y-m-d H:i:s') ?? '',
            $r->getFin()?->format('Y-m-d H:i:s') ?? '',
            $r->getNom(),
            $r->getTelephone(),
            $r->getEmail(),
            $r->getQuantite(),
            $this->getCircuitName($r->getCircuit()),
            $r->getOption()?->getNom(),
            $r->getPrix(),
            $r->getPilote()?->getFirstName(),
            $r->getAvion()?->getImmatriculation(),
            $r->isReport() ? 'Oui' : 'Non',
            $r->isPaid() ? 'Oui' : 'Non',
            $r->isUpsell() ? 'Oui' : 'Non',
            implode(', ', $r->getOrigine()->map(fn($o) => $o->getName())->toArray()),
            implode(', ', $r->getContact()->map(fn($c) => $c->getName())->toArray()),
            $r->getCadeau()?->getCode(),
            $r->getCadeau()?->getBeneficiaire(),
            $r->getCadeau()?->getOffreur(),
            $r->getCadeau()?->getPaymentId(), 
        ], $results);

        return $this->export($request, $headers, $rows, 'reservations');
    }

    #[Route('/exports/cadeaux', name: 'export_cadeaux', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportReservationsCadeaux(Request $request): Response
    {
        $results = $this->getFilteredResults(Cadeau::class, $request);

        $headers = ['Id', 'Code', 'Reference du paiement', 'Date', 'Fin de validité',
        'Beneficiaire', 'Offreur', 'Telephone', 'Email', 'Quantite', 'Circuit', 'Options',
        'Prix', 'Message', 'Origine', 'Utilisé'];

        $rows = array_map(fn(Cadeau $r) => [
            $r->getId(),
            $r->getCode(),
            $r->getPaymentId(),
            $r->getDate()?->format('Y-m-d H:i:s') ?? '',
            $r->getFin()?->format('Y-m-d H:i:s') ?? '',
            $r->getBeneficiaire(),
            $r->getOffreur(),
            $r->getTelephone(),
            $r->getEmail(),
            $r->getQuantite(),
            $this->getCircuitName($r->getCircuit()),
            $r->getOptions()?->getNom(),
            $r->getPrix(),
            $r->getMessage(),
            implode(', ', $r->getOrigine()->map(fn($o) => $o->getName())->toArray()),
            $r->isUsed() ? 'Oui' : 'Non'
        ], $results);

        return $this->export($request, $headers, $rows, 'cadeaux');
    }

    #[Route('/exports/passagers', name: 'export_passagers', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportPassagers(Request $request): Response
    {
        $results = $this->getFilteredResults(Passager::class, $request);
        $headers = ['Id', 'Date', 'Nom', 'Prenom', 'Telephone', 'Email'];

        $rows = array_map(fn(Passager $p) => [
            $p->getId(),
            $p->getDate()?->format('Y-m-d') ?? '',
            $p->getNom(),
            $p->getPrenom(),
            $p->getTelephone(),
            $p->getEmail(),
        ], $results);

        return $this->export($request, $headers, $rows, 'passagers');
    }

    #[Route('/exports/carnet_vols', name: 'export_carnets_vol', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportCarnetsVol(Request $request): Response
    {
        $results = $this->getFilteredResults(CarnetVol::class, $request);
        $headers = ['Id','Date', 'Pilote', 'Aéronef', 'Type de vol', 'Durée', 'Lieu départ', 'Lieux arrivée', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par'];

        $rows = array_map(fn(CarnetVol $c) => [
            $c->getId(),
            $c->getDate()?->format('Y-m-d') ?? '',
            $c->getProfil()?->getPilote()?->getFirstName(),
            $c->getAeronef(),
            $c->getTypeDeVol()?->getLabel(),
            $this->getDecimalToHourMinute($c->getDuree()),
            $c->getLieuDepart(),
            implode(', ', $c->getLieuxArrivee() ?? []),
            $c->getCreatedAt()?->format('Y-m-d H:i') ?? '' ,
            $c->getCreatedBy()?->getFirstName(),
            $c->getUpdatedAt()?->format('Y-m-d H:i') ?? '' ,
            $c->getUpdatedBy()?->getFirstName()
        ], $results);

        return $this->export($request, $headers, $rows, 'carnets_vol');
    }

    #[Route('/exports/prestations', name: 'export_prestations', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportPrestations(Request $request): Response
    {
        $results = $this->getFilteredResults(Prestation::class, $request);
        $headers = [ 'Id', 'Date', 'Pilote', 'Aeronef', 'Horametre départ', 'Duree', 'Horametre fin',
        'Vol Id', 'Circuit', 'Type de vol', 'Quantite', 'Duree Théorique du Vol', 'Vol Modifié le',
        'Vol Modifié par', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par' ];

        $rows = [];

        foreach ($results as $prestation) {
            $vols = $prestation->getVols();
            $first = true;

            foreach ($vols as $vol) {
                $prestationDate = $first ? $prestation->getDate()?->format('Y-m-d H:i') : '';
                $pilote = $first ? ($prestation->getPilote()?->getFirstName() ?? '') : '';
                $aeronef = $first ? $prestation->getAeronef()?->getImmatriculation() ?? '' : '';
                $duree = $first ? $this->getDecimalToTimeForPrestation($prestation) : '';
                $horametreDepart = $first ? $prestation->getHorametreDepart() ?? '' : '';
                $horametreFin = $first ? $prestation->getHorametreFin() ?? '' : '';
                $createdAt = $first ? $prestation->getCreatedAt()?->format('Y-m-d H:i') ?? ''  ?? '' : '';
                $createdBy = $first ? $prestation->getCreatedBy()?->getFirstName() ?? '' : '';
                $updatedAt = $first ? $prestation->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '';
                $updatedBy = $first ? $prestation->getUpdatedBy()?->getFirstName() ?? '' : '';

                $volDuree = $this->getVolDurationToHourMinute($vol->getDuree());

                $rows[] = [
                    $first ? $prestation->getId() : '',
                    $prestationDate,
                    $pilote,
                    $aeronef,
                    $horametreDepart,
                    $duree,
                    $horametreFin,
                    $vol->getId(),
                    $this->getCircuitName($vol->getCircuit()) ?? '',
                    $vol->getCircuit()?->getNature()?->getLabel() ?? '',
                    $vol->getQuantite(),
                    $volDuree,
                    $vol->getUpdatedAt()?->format('Y-m-d H:i') ?? '',
                    $vol->getUpdatedBy()?->getFirstName() ?? '',
                    $createdAt,
                    $createdBy,
                    $updatedAt,
                    $updatedBy
                ];

                $first = false;
            }
        }

        return $this->export($request, $headers, $rows, 'prestations');
    }

    #[Route('/exports/vols', name: 'export_vols', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportVols(Request $request): Response
    {
        $results = $this->getFilteredResults(Vol::class, $request);
        $headers = [ 'Id', 'Date', 'Pilote', 'Aeronef', 'Quantite', 'Circuit', 'Type de vol', 'Duree Théorique',
        'Aéroport', 'Nb Touchés', 'Nb Complets', 'Créé le', 'Créé par', 'Modifié le', 'Modifié par' ];

        $rows = [];

        foreach ($results as $vol) {

            $first = true;
            $prestation = $vol->getPrestation();
            $landings = $vol->getLandings();

            foreach ($landings as $landing) {
                $rows[] = [
                    $first ? $vol->getId() ?? '' : '',
                    $first ? $prestation->getDate()?->format('Y-m-d') : '',
                    $first ? $prestation->getPilote()?->getFirstName() ?? '' : '',
                    $first ? $prestation->getAeronef()?->getImmatriculation() ?? '' : '',
                    $first ? $vol->getQuantite() ?? '' : '',
                    $first ? $this->getCircuitName($vol->getCircuit()) ?? '' : '',
                    $first ? $vol->getCircuit()?->getNature()?->getLabel() ?? '' : '',
                    $first ? $this->getVolDurationToHourMinute($vol->getDuree()) : '',
                    $this->getAirportName($landing),
                    $landing->getTouches() ?? 0,
                    $landing->getComplets() ?? 0,
                    $first ? $vol->getCreatedAt()?->format('Y-m-d H:i') ?? '' : '',
                    $first ? $vol->getCreatedBy()?->getFirstName() ?? '' : '',
                    $first ? $vol->getUpdatedAt()?->format('Y-m-d H:i') ?? '' : '',
                    $first ? $vol->getUpdatedBy()?->getFirstName() ?? '' : ''
                ];
                $first = false;
            }
        }
        return $this->export($request, $headers, $rows, 'prestations');
    }

    #[Route('/exports/payments', name: 'export_payments', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportPayments(Request $request): Response
    {
        $results = $this->getFilteredResults(Payment::class, $request);
        $headers = [ 'Id', 'Date', 'Référence', 'Nom', 'Code de réservation', 'Mode', 'Montant', 'Vol Id'];

        $rows = [];

        foreach ($results as $payment) {
            $details = $payment->getDetails();
            $first = true;

            foreach ($details as $detail) {
                $date = $first ? $payment->getDate()?->format('Y-m-d H:i') : '';
                $reference = $first ? ($payment->getReference() ?? '') : '';
                $name = $first ? ($payment->getReference() ?? '') : '';
                $reservationCode = $first ? ($payment->getReservationCode() ?? '') : '';

                $rows[] = [
                    $first ? $payment->getId() : '',
                    $first ? $payment->getDate()?->format('Y-m-d H:i') : '',
                    $first ? ($payment->getReference() ?? '') : '',
                    $first ? ($payment->getName() ?? '') : '',
                    $first ? ($payment->getReservationCode() ?? '') : '',
                    $this->getPaymentDetailName($detail->getMode()) ?? '',
                    $detail->getAmount(),
                    $this->getPrepaymentInformations($detail->getPrepayment()),
                ];

                $first = false;
            }
        }

        return $this->export($request, $headers, $rows, 'prestations');
    }

    #[Route('/exports/landings', name: 'export_landings', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function exportAtterrissages(Request $request): Response
    {
        $results = $this->getFilteredResults(Landing::class, $request);
        $headers = ['Id', 'Date', 'Aeronef', 'Lieu', 'Nb touches', 'Nb complets'];

        $rows = array_map(fn(Landing $a) => [
            $a->getId(),
            $a->getVol()?->getPrestation()?->getDate()?->format('Y-m-d') ?? '',
            $a->getVol()?->getPrestation()?->getAeronef()?->getImmatriculation(),
            $this->getAirportName($a),
            $a->getTouches() ?? 0,
            $a->getComplets() ?? 0
        ], $results);

        return $this->export($request, $headers, $rows, 'atterrissages');
    }

    private function getPaymentDetailName(string $code): string 
    {
        $payments = [
            'cb'       => 'CB',
            'especes'  => 'Espèces',
            'web'      => 'Site Web',
            'virement' => 'Virement',
            'cheque'   => 'Chèque'
        ];

        return $payments[$code] ?? '';
    }

    private function getCertificatName(string $code): string 
    {
        $certificat = [
            'CL1'  => 'Certificat médical de Classe 1',
            'CL2'  => 'Certificat médical de Classe 2',
            'CA'   => 'Certificat d\'aptitude',
            'CNCI' => 'Certificat de non contre-indication',
            'CE'   => 'Certificat exceptionnel'
        ];

        return $certificat[$code] ?? '';
    }

    private function getValidity(?\DateTimeInterface $validUntil): string 
    {
        if (\is_null($validUntil)) return 'Sans limite';
        return $validUntil?->format('Y-m-d') ?? '';
    }

    private function getPrepaymentInformations(?Cadeau $cadeau): string 
    {
        if (\is_null($cadeau)) return '';

        $paymentId = $cadeau->getPaymentId() ?? '';
        $offreur = $cadeau->getOffreur() ?? '';
        $date = $cadeau->getDate()?->format('d/m/Y') ?? '';

        return "Prépaiement N°$paymentId" . (\strlen($date) > 0 ? " du $date" : '') . (\strlen($offreur) > 0 ? " - $offreur" : '');
    }

    private function getAirportName(Landing $landing): string 
    {
        $code = $landing->getAirportCode() ?? "";
        $name = $landing->getAirportName() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }

    private function getCircuitName(Circuit $circuit): string 
    {
        $code = $circuit->getCode() ?? "";
        $name = $circuit->getNom() ?? "";

        return strlen($code) > 0 && strlen($name) > 0 ? $code . ' - ' . $name : $code . $name;
    }

    private function getDecimalTimeFromLocale(float $duration) : float
    {
        $hours = floor($duration);
        $minutes = ($duration - $hours) * 100;
        $decimal = $hours + ($minutes / 60);
        return round($decimal, 2);
    }

    private function getDecimalToHourMinute(float $decimalDuration): string
    {
        $hours = floor($decimalDuration);
        $minutes = round(($decimalDuration - $hours) * 60);

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getVolDurationToHourMinute(float $duration): string
    {
        $hours = floor($duration);
        $minutes = round(($duration - $hours) * 100);
        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getDecimalToTimeForPrestation(Prestation $prestation): ?string
    {
        $duree = $prestation->getDuree() ?? 0;
        $aeronef = $prestation->getAeronef();

        if (!$aeronef) return null;

        if ($aeronef->isDecimal()) {
            return $this->getDecimalToHourMinute($duree);
        }

        return $this->getVolDurationToHourMinute($duree);
    }
}
