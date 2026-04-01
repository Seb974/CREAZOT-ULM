<?php

declare(strict_types=1);

namespace App\Controller;

use Liip\ImagineBundle\Imagine\Filter\FilterManager;
use Liip\ImagineBundle\Model\Binary;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UploadSiteSettingsAssetController extends AbstractController
{
    private const TARGETS = [
        'logo' => ['dir' => 'images', 'filename' => 'logo.png', 'filter' => 'logo'],
        'favicon' => ['dir' => '', 'filename' => 'favicon.ico', 'filter' => null],
        'apple-touch-icon' => ['dir' => '', 'filename' => 'apple-touch-icon.png', 'filter' => 'apple_touch_icon'],
    ];

    public function __construct(
        #[Autowire('%image.public_dir%')] private readonly string $publicDir,
        private readonly FilterManager $filterManager,
        private readonly Filesystem $filesystem,
    ) {}

    #[Route('/admin/upload/site-settings-asset', name: 'upload_site_settings_asset', methods: ['POST'])]
    #[IsGranted('ROLE_SUPER_ADMIN')]
    public function __invoke(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        $type = strtolower(trim($request->request->get('type', '')));

        if (!$file instanceof UploadedFile || !isset(self::TARGETS[$type])) {
            return new JsonResponse(['error' => 'Fichier ou type manquant/invalide'], 400);
        }

        $target = self::TARGETS[$type];
        $targetDir = $target['dir']
            ? rtrim($this->publicDir, '/') . '/' . $target['dir']
            : rtrim($this->publicDir, '/');

        if (!$this->filesystem->exists($targetDir)) {
            $this->filesystem->mkdir($targetDir, 0755);
        }

        $filePath = $targetDir . '/' . $target['filename'];

        try {
            if ($type === 'favicon') {
                $ext = strtolower($file->getClientOriginalExtension());
                $mime = $file->getMimeType();
                $isIco = $ext === 'ico' || in_array($mime, ['image/x-icon', 'image/vnd.microsoft.icon'], true);

                if ($isIco) {
                    file_put_contents($filePath, file_get_contents($file->getPathname()));
                } else {
                    $this->generateFavicon($file, $filePath);
                }
            } elseif ($target['filter']) {
                $binary = new Binary(
                    file_get_contents($file->getPathname()),
                    $file->getMimeType(),
                    $file->guessExtension()
                );
                $filtered = $this->filterManager->applyFilter($binary, $target['filter']);
                file_put_contents($filePath, $filtered->getContent());
            } else {
                file_put_contents($filePath, file_get_contents($file->getPathname()));
            }

            $relativePath = '/' . ltrim(str_replace(realpath($this->publicDir) ?: $this->publicDir, '', realpath($filePath) ?: $filePath), '/');
            return new JsonResponse(['path' => $relativePath]);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function generateFavicon(UploadedFile $file, string $outputPath): void
    {
        $imagick = new \Imagick($file->getPathname());
        $imagick->setImageFormat('ico');
        $imagick->thumbnailImage(32, 32, true);
        file_put_contents($outputPath, $imagick->getImageBlob());
        $imagick->destroy();
    }
}
