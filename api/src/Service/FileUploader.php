<?php

namespace App\Service;

use Liip\ImagineBundle\Model\Binary;
use Symfony\Component\Filesystem\Filesystem;
use Liip\ImagineBundle\Imagine\Filter\FilterManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class FileUploader
{
    private const FIXED_FILENAMES = [
        'logo' => 'logo.png',
        'pdfbackground' => 'Plane.png',
        'mapicon' => 'FlightIcon.png',
        'favicon' => 'favicon.ico',
        'apple-touch-icon' => 'apple-touch-icon.png',
    ];

    public function __construct(
        #[Autowire('%image.client_dir%')] private readonly string $clientDirectory,
        #[Autowire('%image.shared_dir%')] private readonly string $sharedDirectory,
        #[Autowire('%image.public_dir%')] private readonly string $publicDir,
        private readonly FilterManager $filterManager,
        private readonly Filesystem $filesystem
    ) {}

    public function upload(UploadedFile $file, string $type, ?float $opacity = null): string
    {
        $type = trim(strtolower($type));

        if (!isset(self::FIXED_FILENAMES[$type])) {
            throw new \InvalidArgumentException("Type de fichier non reconnu : $type");
        }

        $isSharedAsset = in_array($type, ['favicon', 'apple-touch-icon']);
        $targetDir = $isSharedAsset ? $this->sharedDirectory : $this->clientDirectory;

        if (!$this->filesystem->exists($targetDir)) {
            $this->filesystem->mkdir($targetDir, 0755);
        }

        $filename = self::FIXED_FILENAMES[$type];
        $filePath = sprintf('%s/%s', rtrim($targetDir, '/'), $filename);

        // Supprimer le fichier existant s'il y en a un
        if ($this->filesystem->exists($filePath)) {
            $this->filesystem->remove($filePath);
        }

        // Traitements par type
        switch ($type) {
            case 'logo':
            case 'mapicon':
            case 'apple-touch-icon':
                $filter = match ($type) {
                    'logo' => 'logo',
                    'mapicon' => 'map_icon',
                    'apple-touch-icon' => 'apple_touch_icon',
                };
                $filtered = $this->filterManager->applyFilter($this->createBinaryFromFile($file), $filter);
                $this->filesystem->dumpFile($filePath, $filtered->getContent());
                break;
        
            case 'pdfbackground':
                $filtered = $this->filterManager->applyFilter($this->createBinaryFromFile($file), 'pdf_background');
                $imageWithOpacity = $this->applyOpacityFromBlob($filtered->getContent(), $opacity ?? 0.3);
                $this->filesystem->dumpFile($filePath, $imageWithOpacity->getImageBlob());
                break;
        
            case 'favicon':
                // On génère à la fois favicon.ico ET apple-touch-icon.png à partir du même fichier
                // Génération du .ico (et retour de ce chemin)
                $this->generateFavicon($file, $filePath);
        
                // Génération silencieuse du apple-touch-icon.png
                $applePath = rtrim($this->sharedDirectory, '/') . '/apple-touch-icon.png';
                $filtered = $this->filterManager->applyFilter($this->createBinaryFromFile($file), 'apple_touch_icon');
                $this->filesystem->dumpFile($applePath, $filtered->getContent());
                break;
        
            default:
                // Cas sans traitement spécifique : simple déplacement
                $file->move($targetDir, $filename);
                break;
        }

        return '/' . ltrim(str_replace(realpath($this->publicDir), '', realpath($filePath)), '/');
    }

    private function createBinaryFromFile(UploadedFile $file): Binary
    {
        return new Binary(
            content: file_get_contents($file->getPathname()),
            mimeType: $file->getMimeType(),
            format: $file->guessExtension() ?? 'png'
        );
    }

    private function applyOpacityFromBlob(string $imageContent, float $opacity): \Imagick
    {
        try {
            $imagick = new \Imagick();
            $imagick->readImageBlob($imageContent);
            $imagick->setImageOpacity($opacity);

            return $imagick;

        } catch (\ImagickException $e) {
            throw new \RuntimeException('Erreur lors de la génération du favicon : ' . $e->getMessage(), 0, $e);
        }
    }

    private function generateFavicon(UploadedFile $file, string $destinationPath): void
    {
        $sizes = [16, 32, 48];

        try {
            $ico = new \Imagick();

            foreach ($sizes as $size) {
                $img = new \Imagick($file->getPathname());
                $img->setImageFormat('png');
                $img->resizeImage($size, $size, \Imagick::FILTER_LANCZOS, 1);
                $ico->addImage($img);
            }
    
            $ico->setFormat('ico');
            $this->filesystem->dumpFile($destinationPath, $ico->getImagesBlob());

        } catch (\ImagickException $e) {
            throw new \RuntimeException('Erreur lors de la génération du favicon : ' . $e->getMessage(), 0, $e);
        }
    }
}
