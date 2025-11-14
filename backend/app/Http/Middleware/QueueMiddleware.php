<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

class QueueMiddleware
{
    private const ACTIVE_USERS_KEY = 'queue:active_users';
    private const WAITING_QUEUE_KEY = 'queue:waiting';
    private const USER_SESSION_PREFIX = 'queue:session:';
    private const SESSION_TTL = 300; // 5 minutes

    public function handle(Request $request, Closure $next): Response
    {
        // Check if queue is enabled
        if (!config('queue.enabled')) {
            return $next($request);
        }

        // Check for bypass token
        if ($request->header('X-Queue-Bypass') === config('queue.bypass_token')) {
            return $next($request);
        }

        $sessionId = $request->header('X-Session-Id') ?? session()->getId();
        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;

        // Check if user already has an active session
        if (Redis::exists($userSessionKey)) {
            // Refresh TTL
            Redis::expire($userSessionKey, self::SESSION_TTL);
            return $next($request);
        }

        $maxUsers = config('queue.max_concurrent_users');
        $activeUsers = Redis::scard(self::ACTIVE_USERS_KEY);

        // If under capacity, allow immediate access
        if ($activeUsers < $maxUsers) {
            $this->activateUser($sessionId);
            return $next($request);
        }

        // User needs to wait in queue
        return response()->json([
            'queued' => true,
            'position' => $this->getQueuePosition($sessionId),
            'estimated_wait_seconds' => $this->estimateWaitTime($sessionId),
            'message' => 'Too many users. You are in the waiting queue.'
        ], 429);
    }

    private function activateUser(string $sessionId): void
    {
        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;

        Redis::sadd(self::ACTIVE_USERS_KEY, $sessionId);
        Redis::setex($userSessionKey, self::SESSION_TTL, time());

        // Remove from waiting queue if present
        Redis::zrem(self::WAITING_QUEUE_KEY, $sessionId);
    }

    private function getQueuePosition(string $sessionId): int
    {
        // Add to waiting queue if not already there
        if (!Redis::zscore(self::WAITING_QUEUE_KEY, $sessionId)) {
            Redis::zadd(self::WAITING_QUEUE_KEY, time(), $sessionId);
        }

        $position = Redis::zrank(self::WAITING_QUEUE_KEY, $sessionId);
        return $position !== null ? $position + 1 : 0;
    }

    private function estimateWaitTime(string $sessionId): int
    {
        $position = $this->getQueuePosition($sessionId);
        // Estimate 30 seconds per position
        return $position * 30;
    }
}
