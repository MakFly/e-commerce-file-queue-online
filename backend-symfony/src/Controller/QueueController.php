<?php

namespace App\Controller;

use App\Service\QueueService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/queue', name: 'api_queue_')]
class QueueController extends AbstractController
{
    public function __construct(
        private QueueService $queueService
    ) {}

    #[Route('/status', name: 'status', methods: ['GET'])]
    public function status(Request $request): JsonResponse
    {
        $sessionId = $request->query->get('session_id')
            ?? $request->headers->get('X-Session-Id');

        if (!$sessionId) {
            return $this->json([
                'message' => 'Session ID is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $status = $this->queueService->getStatus($sessionId);

        return $this->json($status);
    }

    #[Route('/heartbeat', name: 'heartbeat', methods: ['POST'])]
    public function heartbeat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $sessionId = $data['session_id']
            ?? $request->headers->get('X-Session-Id');

        if (!$sessionId) {
            return $this->json([
                'message' => 'Session ID is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $result = $this->queueService->heartbeat($sessionId);

        return $this->json($result);
    }

    #[Route('/release', name: 'release', methods: ['POST'])]
    public function release(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $sessionId = $data['session_id']
            ?? $request->headers->get('X-Session-Id');

        if (!$sessionId) {
            return $this->json([
                'message' => 'Session ID is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->queueService->release($sessionId);

        return $this->json([
            'status' => 'released'
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $stats = $this->queueService->getStats();

        return $this->json($stats);
    }
}
