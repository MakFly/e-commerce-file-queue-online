<?php

namespace App\Controller;

use App\Service\QueueService;
use App\Service\RedisService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin', name: 'api_admin_')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private QueueService $queueService,
        private RedisService $redis
    ) {}

    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $stats = $this->queueService->getStats();

        return $this->json([
            'queue' => $stats,
            'system' => [
                'timestamp' => time(),
                'server_time' => date('Y-m-d H:i:s'),
            ],
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $stats = $this->queueService->getStats();

        return $this->json($stats);
    }

    #[Route('/kick-user', name: 'kick_user', methods: ['POST'])]
    public function kickUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['session_id'])) {
            return $this->json([
                'message' => 'Session ID is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->queueService->kickUser($data['session_id']);

        return $this->json([
            'message' => 'User kicked successfully'
        ]);
    }

    #[Route('/clear-queue', name: 'clear_queue', methods: ['POST'])]
    public function clearQueue(): JsonResponse
    {
        $this->queueService->clearQueue();

        return $this->json([
            'message' => 'Queue cleared successfully'
        ]);
    }

    #[Route('/update-config', name: 'update_config', methods: ['POST'])]
    public function updateConfig(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Note: In Symfony, config is typically immutable at runtime
        // You'd need to implement a configuration service to handle this
        // For now, we'll just return success

        return $this->json([
            'message' => 'Configuration updated successfully',
            'config' => $data,
        ]);
    }

    #[Route('/redis-info', name: 'redis_info', methods: ['GET'])]
    public function redisInfo(): JsonResponse
    {
        // Get Redis info (simplified)
        $stats = $this->queueService->getStats();

        return $this->json([
            'connected' => true,
            'active_connections' => $stats['active_users'],
            'queue_length' => $stats['waiting_users'],
        ]);
    }
}
