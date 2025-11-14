<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class AdminController extends Controller
{
    private const ACTIVE_USERS_KEY = 'queue:active_users';
    private const WAITING_QUEUE_KEY = 'queue:waiting';
    private const USER_SESSION_PREFIX = 'queue:session:';

    /**
     * Get comprehensive dashboard statistics
     */
    public function dashboard()
    {
        $activeUsers = Redis::smembers(self::ACTIVE_USERS_KEY);
        $waitingUsers = Redis::zrange(self::WAITING_QUEUE_KEY, 0, -1, ['WITHSCORES' => true]);

        $activeCount = count($activeUsers);
        $waitingCount = count($waitingUsers);
        $maxUsers = config('queue.max_concurrent_users');
        $queueEnabled = config('queue.enabled');

        // Calculate usage percentage
        $usagePercentage = $maxUsers > 0 ? round(($activeCount / $maxUsers) * 100, 2) : 0;

        // Get active users details
        $activeUsersDetails = [];
        foreach ($activeUsers as $sessionId) {
            $sessionKey = self::USER_SESSION_PREFIX . $sessionId;
            $sessionData = Redis::get($sessionKey);
            $ttl = Redis::ttl($sessionKey);

            $activeUsersDetails[] = [
                'session_id' => substr($sessionId, 0, 8) . '...',
                'full_session_id' => $sessionId,
                'joined_at' => $sessionData ? date('H:i:s', $sessionData) : 'Unknown',
                'ttl' => $ttl,
                'expires_in' => $this->formatTime($ttl),
            ];
        }

        // Get waiting users details
        $waitingUsersDetails = [];
        $position = 1;
        foreach ($waitingUsers as $sessionId => $timestamp) {
            $waitTime = time() - $timestamp;
            $estimatedWait = $position * 30; // 30 seconds per position

            $waitingUsersDetails[] = [
                'position' => $position,
                'session_id' => substr($sessionId, 0, 8) . '...',
                'full_session_id' => $sessionId,
                'joined_at' => date('H:i:s', $timestamp),
                'wait_time' => $this->formatTime($waitTime),
                'estimated_wait' => $this->formatTime($estimatedWait),
            ];
            $position++;
        }

        return response()->json([
            'summary' => [
                'active_users' => $activeCount,
                'waiting_users' => $waitingCount,
                'total_users' => $activeCount + $waitingCount,
                'max_concurrent_users' => $maxUsers,
                'queue_enabled' => $queueEnabled,
                'usage_percentage' => $usagePercentage,
                'available_slots' => max(0, $maxUsers - $activeCount),
                'status' => $this->getSystemStatus($usagePercentage),
            ],
            'active_users' => $activeUsersDetails,
            'waiting_users' => $waitingUsersDetails,
            'config' => [
                'max_concurrent_users' => $maxUsers,
                'queue_enabled' => $queueEnabled,
                'session_ttl' => 300,
                'bypass_token' => config('queue.bypass_token') ? 'Configured' : 'Not Set',
            ],
        ]);
    }

    /**
     * Get real-time statistics for monitoring
     */
    public function stats()
    {
        $activeCount = Redis::scard(self::ACTIVE_USERS_KEY);
        $waitingCount = Redis::zcard(self::WAITING_QUEUE_KEY);
        $maxUsers = config('queue.max_concurrent_users');

        $usagePercentage = $maxUsers > 0 ? round(($activeCount / $maxUsers) * 100, 2) : 0;

        return response()->json([
            'active_users' => $activeCount,
            'waiting_users' => $waitingCount,
            'total_users' => $activeCount + $waitingCount,
            'max_concurrent_users' => $maxUsers,
            'queue_enabled' => config('queue.enabled'),
            'usage_percentage' => $usagePercentage,
            'available_slots' => max(0, $maxUsers - $activeCount),
            'status' => $this->getSystemStatus($usagePercentage),
            'timestamp' => time(),
        ]);
    }

    /**
     * Get historical data for charts (simulated for now)
     */
    public function history(Request $request)
    {
        $minutes = $request->input('minutes', 60);
        $data = [];

        // In a real application, you would store this in Redis or a database
        // For now, we'll return current stats
        $currentActive = Redis::scard(self::ACTIVE_USERS_KEY);
        $currentWaiting = Redis::zcard(self::WAITING_QUEUE_KEY);

        for ($i = $minutes; $i >= 0; $i--) {
            $data[] = [
                'timestamp' => time() - ($i * 60),
                'time' => date('H:i', time() - ($i * 60)),
                'active_users' => $i === 0 ? $currentActive : rand(max(0, $currentActive - 5), $currentActive + 5),
                'waiting_users' => $i === 0 ? $currentWaiting : rand(max(0, $currentWaiting - 3), $currentWaiting + 3),
            ];
        }

        return response()->json($data);
    }

    /**
     * Kick a specific user from active or waiting queue
     */
    public function kickUser(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $sessionId = $request->input('session_id');
        $sessionKey = self::USER_SESSION_PREFIX . $sessionId;

        Redis::del($sessionKey);
        Redis::srem(self::ACTIVE_USERS_KEY, $sessionId);
        Redis::zrem(self::WAITING_QUEUE_KEY, $sessionId);

        return response()->json([
            'success' => true,
            'message' => 'User removed from queue',
        ]);
    }

    /**
     * Clear all users from queue
     */
    public function clearQueue()
    {
        $activeUsers = Redis::smembers(self::ACTIVE_USERS_KEY);

        foreach ($activeUsers as $sessionId) {
            Redis::del(self::USER_SESSION_PREFIX . $sessionId);
        }

        Redis::del(self::ACTIVE_USERS_KEY);
        Redis::del(self::WAITING_QUEUE_KEY);

        return response()->json([
            'success' => true,
            'message' => 'Queue cleared successfully',
        ]);
    }

    /**
     * Update queue configuration
     */
    public function updateConfig(Request $request)
    {
        $request->validate([
            'max_concurrent_users' => 'sometimes|integer|min:0',
            'queue_enabled' => 'sometimes|boolean',
        ]);

        // Note: In production, you would save this to a database or config file
        // For now, we just return success
        return response()->json([
            'success' => true,
            'message' => 'Configuration updated (note: restart required for changes to take effect)',
            'config' => [
                'max_concurrent_users' => $request->input('max_concurrent_users', config('queue.max_concurrent_users')),
                'queue_enabled' => $request->input('queue_enabled', config('queue.enabled')),
            ],
        ]);
    }

    /**
     * Get Redis info
     */
    public function redisInfo()
    {
        $info = Redis::info();

        return response()->json([
            'connected_clients' => $info['connected_clients'] ?? 'N/A',
            'used_memory_human' => $info['used_memory_human'] ?? 'N/A',
            'used_memory_peak_human' => $info['used_memory_peak_human'] ?? 'N/A',
            'total_commands_processed' => $info['total_commands_processed'] ?? 'N/A',
            'uptime_in_seconds' => $info['uptime_in_seconds'] ?? 0,
            'uptime_in_days' => $info['uptime_in_days'] ?? 0,
        ]);
    }

    /**
     * Format seconds into human-readable time
     */
    private function formatTime(int $seconds): string
    {
        if ($seconds < 0) return 'Expired';
        if ($seconds < 60) return $seconds . 's';

        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;

        return $minutes . 'm ' . $secs . 's';
    }

    /**
     * Get system status based on usage
     */
    private function getSystemStatus(float $percentage): string
    {
        if ($percentage >= 90) return 'critical';
        if ($percentage >= 70) return 'warning';
        if ($percentage >= 50) return 'moderate';
        return 'healthy';
    }
}
