<?php

namespace App\Controller;

use App\Dto\ClientInput;
use App\Entity\Client;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UploadClientAssetController extends AbstractController
{
    #[Route('/admin/upload/client-asset', name: 'upload_client_asset', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadClientAsset( Request $request,FileUploader $uploader ): JsonResponse 
    {
        $file = $request->files->get('file');
        $type = $request->request->get('type');
        $opacity = $request->request->get('opacity');

        if (!$file instanceof UploadedFile || !$type) {
            return new JsonResponse(['error' => 'Fichier ou type manquant'], 400);
        }

        try {
            $path = $uploader->upload($file, $type, $opacity ? (float)$opacity : null);
            return new JsonResponse(['path' => $path]);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}