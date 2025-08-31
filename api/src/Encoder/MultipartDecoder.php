<?php

namespace App\Encoder;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\Encoder\DecoderInterface;

final class MultipartDecoder implements DecoderInterface
{
    public const FORMAT = 'multipart';

    public function __construct(private readonly RequestStack $requestStack)
    {
    }

    public function decode(string $data, string $format, array $context = []): ?array
    {
        $request = $this->requestStack->getCurrentRequest();

        if (!$request) {
            return null;
        }

        $requestData = $request->request->all();

        // $decodedData = array_map(static function (string $element) {
        //     // Multipart form values will be encoded in JSON.
        //     return json_decode($element, true, flags: \JSON_THROW_ON_ERROR);
        // }, $requestData);
        $decodedData = [];

        foreach ($requestData as $key => $element) {
            if (is_string($element)) {
                $trimmed = trim($element);
                // Tente de décoder si c’est du JSON
                if ((str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}')) ||
                    (str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']'))) {
                    $decodedData[$key] = json_decode($element, true, 512, \JSON_THROW_ON_ERROR);
                } else {
                    $decodedData[$key] = $element;
                }
            } else {
                $decodedData[$key] = $element;
            }
        }

        return $decodedData + $request->files->all();
    }

    public function supportsDecoding(string $format): bool
    {
        return self::FORMAT === $format;
    }
}