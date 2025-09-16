<?php

namespace App\Service\Export;

use App\Entity\MediaObject;
use App\Service\ClientGetter;
use Doctrine\Common\Collections\Collection;

class ExportUtils
{
    private string $mediaUrl;
    private ClientGetter $clientGetter;

    public function __construct(string $mediaUrl, ClientGetter $clientGetter)
    {
        $this->mediaUrl = $this->getFormattedFolderName($mediaUrl);
        $this->clientGetter = $clientGetter;
    }

    public function makeLink(?MediaObject $mediaObject, ?string $label = null, string $format = 'csv'): string
    {
        if (!$mediaObject) return $label ?? '';

        $label = $label ?: $mediaObject->getDescription() ?: basename(trim($mediaObject->filePath, '/'));

        $baseUrl = rtrim($this->clientGetter->get()?->getUrl() ?? '', '/');
        $url = $mediaObject->filePath ? $baseUrl . $this->mediaUrl . basename(trim($mediaObject->filePath, '/')) : null;

        if ($format === 'csv') {
            return $url ? ($label === $url ? $url : sprintf("%s\n(%s)", $label, $url)) : $label;
        }

        return $url ? sprintf('<a href="%s" target="_blank">%s</a>', htmlspecialchars($url, ENT_QUOTES), htmlspecialchars($label, ENT_QUOTES)) : $label;
    }

    public function getLinkList(?Collection $documents, string $format = 'csv'): string 
    {
        if (!$documents || $documents->isEmpty()) return '';

        $linkList = '';
        foreach ($documents as $doc) {
            $linkList .= $this->makeLink($doc, null, $format);
            $linkList .= $format === 'csv' ? "\n" : '<br>';
        }
        return rtrim($linkList, $format === 'csv' ? "\n" : '<br>');
    }

    private function getFormattedFolderName(string $folder): string 
    {
        $folder = trim($folder, '/');
        return '/' . $folder . '/';  
    }
}