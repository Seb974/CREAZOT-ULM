<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrotrakProxyController extends AbstractController
{
    private string $microtrakApiKey;
    private HttpClientInterface $httpClient;

    public function __construct(string $microtrakApiKey, HttpClientInterface $httpClient)
    {
        $this->microtrakApiKey = $microtrakApiKey;
        $this->httpClient = $httpClient;
    }

    #[Route('/admin/microtrak/position/{id}', name: 'microtrak_proxy', methods: ['GET'])]
    public function getMicrotrakData(string $id, Request $request): JsonResponse
    {
        //https:/suividevol.fr/api/v0/
        $url = "https://dev.baliselora.fr/api/v0/?apikey=". $this->microtrakApiKey . "&deveui=" . $id;

        try {
            $response = $this->httpClient->request('GET', $url);
            $statusCode = $response->getStatusCode();

            if ($statusCode == 200) {
                $data = $response->toArray();
    
                // Split des coordonnées si besoin
                if (isset($data['position'])) {
                    [$lat, $lng] = explode(',', $data['position']);
                    $data['lat'] = (float) $lat;
                    $data['lng'] = (float) $lng;
                    unset($data['position']);
                }
    
                return new JsonResponse($data);
            } else if ($statusCode == 204) {
                return new JsonResponse([], $statusCode);
            } else {
                return new JsonResponse(['error' => 'Erreur API'], $statusCode);
            }
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Erreur lors de l’appel à Microtrak', 'message' => $e->getMessage()], 500);
        }
    }
}
