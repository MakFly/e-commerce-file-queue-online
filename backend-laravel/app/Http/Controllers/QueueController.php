<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class QueueController extends Controller
{
    private const ACTIVE_USERS_KEY = 'queue:active_users';
    private const WAITING_QUEUE_KEY = 'queue:waiting';
    private const USER_SESSION_PREFIX = 'queue:session:';

    /**
     * Check queue status for a session
     */
    public function status(Request $request)
    {
        $sessionId = $request->input('session_id') ?? $request->header('X-Session-Id');

        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;
        $isActive = Redis::exists($userSessionKey);

        if ($isActive) {
            return response()->json([
                'status' => 'active',
                'active_users' => Redis::scard(self::ACTIVE_USERS_KEY),
                'max_users' => config('queue.max_concurrent_users'),
            ]);
        }

        $position = Redis::zrank(self::WAITING_QUEUE_KEY, $sessionId);

        if ($position === null) {
            // Not in queue yet, add them
            Redis::zadd(self::WAITING_QUEUE_KEY, time(), $sessionId);
            $position = Redis::zrank(self::WAITING_QUEUE_KEY, $sessionId);
        }

        $canActivate = $this->tryActivateNextInQueue($sessionId);

        if ($canActivate) {
            return response()->json([
                'status' => 'active',
                'message' => 'You can now access the site',
            ]);
        }

        return response()->json([
            'status' => 'waiting',
            'position' => $position + 1,
            'queue_length' => Redis::zcard(self::WAITING_QUEUE_KEY),
            'estimated_wait_seconds' => ($position + 1) * 30,
            'active_users' => Redis::scard(self::ACTIVE_USERS_KEY),
            'max_users' => config('queue.max_concurrent_users'),
        ]);
    }

    /**
     * Heartbeat to keep session alive
     */
    public function heartbeat(Request $request)
    {
        $sessionId = $request->input('session_id') ?? $request->header('X-Session-Id');

        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;

        if (Redis::exists($userSessionKey)) {
            Redis::expire($userSessionKey, 300);
            return response()->json(['status' => 'alive']);
        }

        return response()->json(['status' => 'expired'], 410);
    }

    /**
     * Release a session (user leaves)
     */
    public function release(Request $request)
    {
        $sessionId = $request->input('session_id') ?? $request->header('X-Session-Id');

        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;

        Redis::del($userSessionKey);
        Redis::srem(self::ACTIVE_USERS_KEY, $sessionId);
        Redis::zrem(self::WAITING_QUEUE_KEY, $sessionId);

        return response()->json(['status' => 'released']);
    }

    /**
     * Get statistics (admin endpoint)
     */
    public function stats()
    {
        return response()->json([
            'active_users' => Redis::scard(self::ACTIVE_USERS_KEY),
            'waiting_users' => Redis::zcard(self::WAITING_QUEUE_KEY),
            'max_concurrent_users' => config('queue.max_concurrent_users'),
            'queue_enabled' => config('queue.enabled'),
        ]);
    }

    /**
     * Try to activate next user in queue
     */
    private function tryActivateNextInQueue(string $sessionId): bool
    {
        $maxUsers = config('queue.max_concurrent_users');
        $activeUsers = Redis::scard(self::ACTIVE_USERS_KEY);

        if ($activeUsers >= $maxUsers) {
            return false;
        }

        // Check if this user is next in line
        $nextUsers = Redis::zrange(self::WAITING_QUEUE_KEY, 0, 0);

        if (empty($nextUsers) || $nextUsers[0] !== $sessionId) {
            return false;
        }

        // Activate this user
        $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;
        Redis::sadd(self::ACTIVE_USERS_KEY, $sessionId);
        Redis::setex($userSessionKey, 300, time());
        Redis::zrem(self::WAITING_QUEUE_KEY, $sessionId);

        return true;
    }

    /**
     * Clean up expired sessions (should be called by scheduler)
     */
    public function cleanup()
    {
        $activeUsers = Redis::smembers(self::ACTIVE_USERS_KEY);
        $cleaned = 0;

        foreach ($activeUsers as $sessionId) {
            $userSessionKey = self::USER_SESSION_PREFIX . $sessionId;
            if (!Redis::exists($userSessionKey)) {
                Redis::srem(self::ACTIVE_USERS_KEY, $sessionId);
                $cleaned++;
            }
        }

        return response()->json([
            'cleaned' => $cleaned,
            'message' => "Cleaned up {$cleaned} expired sessions"
        ]);
    }
}
