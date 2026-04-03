<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\MediaObject;
use App\Service\ClientGetter;
use App\Service\OdooJsonRpcService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class OdooDocumentController extends AbstractController
{
    private const DOC_TYPE_MAP = [
        'profil_pilote' => 'Pilote',
        'aeronef' => 'Aéronef',
        'airport' => 'Aérodrome',
        'entretien' => 'Entretien',
        'expense' => 'Dépense',
    ];

    public function __construct(
        private readonly OdooJsonRpcService $odooService,
        private readonly EntityManagerInterface $em,
        private readonly ClientGetter $clientGetter,
        private readonly LoggerInterface $logger,
    ) {}

    #[Route('/admin/odoo-documents/upload', name: 'odoo_document_upload', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        $entityType = $request->request->get('entityType', '');
        $entityId = $request->request->get('entityId');

        if (!$file instanceof UploadedFile) {
            return new JsonResponse(['error' => 'Fichier manquant'], 400);
        }

        $docType = self::DOC_TYPE_MAP[$entityType] ?? 'Autre';

        $client = $this->clientGetter->get();
        if (!$client) {
            return new JsonResponse(['error' => 'Client introuvable'], 403);
        }

        $odooPartnerId = $client->getOdooCustomerId();
        if (!$odooPartnerId) {
            return new JsonResponse(['error' => 'Client non synchronisé avec Odoo'], 400);
        }

        try {
            $base64 = base64_encode(file_get_contents($file->getPathname()));
            $fileName = $file->getClientOriginalName();
            $mimetype = $file->getMimeType() ?? 'application/octet-stream';

            $odooDocId = $this->odooService->uploadDocument(
                (int) $odooPartnerId,
                $client->getName() ?? 'Client',
                $fileName,
                $base64,
                $mimetype,
                $docType,
            );

            $mediaObject = new MediaObject();
            $mediaObject->setOdooDocumentId($odooDocId);
            $mediaObject->setClient($client);
            $mediaObject->description = $fileName;

            if ($entityId) {
                $this->linkToParentEntity($mediaObject, $entityType, (int) $entityId);
            }

            $this->em->persist($mediaObject);
            $this->em->flush();

            return new JsonResponse([
                '@id' => '/media_objects/' . $mediaObject->getId(),
                '@type' => 'https://schema.org/MediaObject',
                'id' => $mediaObject->getId(),
                'contentUrl' => '/admin/odoo-documents/' . $odooDocId . '/download',
                'description' => $fileName,
                'createdAt' => $mediaObject->createdAt?->format(\DateTimeInterface::ATOM),
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Odoo document upload failed', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Échec de l\'upload: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/admin/odoo-documents/{odooDocId}/download', name: 'odoo_document_download', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function download(int $odooDocId): Response
    {
        try {
            $client = $this->clientGetter->get();
            if (!$client || !$client->getOdooCustomerId()) {
                return new JsonResponse(['error' => 'Accès refusé'], 403);
            }

            $doc = $this->odooService->getDocumentContent($odooDocId);
            if (!$doc || empty($doc['datas'])) {
                return new JsonResponse(['error' => 'Document introuvable'], 404);
            }

            $verifyDomain = [['id', '=', $odooDocId], ['partner_id', '=', (int) $client->getOdooCustomerId()]];
            $check = $this->odooService->execute('documents.document', 'search_count', [$verifyDomain]);
            if (!$check) {
                return new JsonResponse(['error' => 'Accès refusé'], 403);
            }

            $content = base64_decode($doc['datas']);
            $fileName = $doc['name'] ?? 'document';
            $mimetype = $doc['mimetype'] ?? 'application/octet-stream';

            return new StreamedResponse(function () use ($content) {
                echo $content;
            }, 200, [
                'Content-Type' => $mimetype,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                'Content-Length' => strlen($content),
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Odoo document download failed', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Erreur de téléchargement'], 500);
        }
    }

    #[Route('/admin/odoo-documents/{odooDocId}', name: 'odoo_document_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(int $odooDocId): JsonResponse
    {
        try {
            $mediaObject = $this->em->getRepository(MediaObject::class)->findOneBy(['odooDocumentId' => $odooDocId]);

            if ($mediaObject) {
                $client = $this->clientGetter->get();
                if (!$client || $mediaObject->get()?->getId() !== $client->getId()) {
                    return new JsonResponse(['error' => 'Accès refusé'], 403);
                }

                $this->em->remove($mediaObject);
                $this->em->flush();
            }

            $this->odooService->deleteDocument($odooDocId);

            return new JsonResponse(null, 204);
        } catch (\Throwable $e) {
            $this->logger->error('Odoo document delete failed', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Erreur de suppression'], 500);
        }
    }

    #[Route('/admin/odoo-documents', name: 'odoo_document_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(Request $request): JsonResponse
    {
        try {
            $client = $this->clientGetter->get();
            if (!$client || !$client->getOdooCustomerId()) {
                return new JsonResponse([], 200);
            }

            $docType = $request->query->get('docType');
            $documents = $this->odooService->listDocuments((int) $client->getOdooCustomerId(), $docType);

            return new JsonResponse($documents);
        } catch (\Throwable $e) {
            $this->logger->error('Odoo document list failed', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Erreur de récupération'], 500);
        }
    }

    private function linkToParentEntity(MediaObject $mediaObject, string $entityType, int $entityId): void
    {
        $entityClass = match ($entityType) {
            'profil_pilote' => \App\Entity\ProfilPilote::class,
            'aeronef' => \App\Entity\Aeronef::class,
            'airport' => \App\Entity\Airport::class,
            'entretien' => \App\Entity\Entretien::class,
            default => null,
        };

        if (!$entityClass) {
            return;
        }

        $parent = $this->em->getRepository($entityClass)->find($entityId);
        if (!$parent) {
            return;
        }

        $setter = match ($entityType) {
            'profil_pilote' => 'setProfilPilote',
            'aeronef' => 'setAeronef',
            'airport' => 'setAirport',
            'entretien' => 'setEntretien',
            default => null,
        };

        if ($setter) {
            $mediaObject->$setter($parent);
        }
    }
}
