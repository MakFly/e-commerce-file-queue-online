<?php

namespace App\Service;

class QueueService
{
    private const QUEUE_ACTIVE_USERS = 'queue:active_users';
    private const QUEUE_WAITING = 'queue:waiting';
    private const QUEUE_SESSION = 'queue:session:';
    private const SESSION_TTL = 300; // 5 minutes

    public function __construct(
        private RedisService $redis,
        private int $maxConcurrentUsers,
        private bool $queueEnabled
    ) {}

    /**
     * Get queue status for a session
     */
    public function getStatus(string $sessionId): array
    {
        // Check if session is active
        if ($this->redis->sismember(self::QUEUE_ACTIVE_USERS, $sessionId)) {
            $this->refreshSession($sessionId);

            return [
                'status' => 'active',
                'active_users' => $this->redis->scard(self::QUEUE_ACTIVE_USERS),
                'max_users' => $this->maxConcurrentUsers,
            ];
        }

        // Check if in waiting queue
        $position = $this->redis->zrank(self::QUEUE_WAITING, $sessionId);
        if ($position !== null) {
            return [
                'status' => 'waiting',
                'position' => $position + 1,
                'queue_length' => $this->redis->zcard(self::QUEUE_WAITING),
                'estimated_wait_seconds' => ($position + 1) * 30,
                'active_users' => $this->redis->scard(self::QUEUE_ACTIVE_USERS),
                'max_users' => $this->maxConcurrentUsers,
            ];
        }

        // Try to activate session
        if ($this->canActivate()) {
            $this->activateSession($sessionId);

            return [
                'status' => 'active',
                'active_users' => $this->redis->scard(self::QUEUE_ACTIVE_USERS),
                'max_users' => $this->maxConcurrentUsers,
            ];
        }

        // Add to waiting queue
        $this->addToQueue($sessionId);
        $position = $this->redis->zrank(self::QUEUE_WAITING, $sessionId);

        return [
            'status' => 'waiting',
            'position' => ($position ?? 0) + 1,
            'queue_length' => $this->redis->zcard(self::QUEUE_WAITING),
            'estimated_wait_seconds' => (($position ?? 0) + 1) * 30,
            'active_users' => $this->redis->scard(self::QUEUE_ACTIVE_USERS),
            'max_users' => $this->maxConcurrentUsers,
        ];
    }

    /**
     * Send heartbeat to keep session alive
     */
    public function heartbeat(string $sessionId): array
    {
        if ($this->redis->exists(self::QUEUE_SESSION . $sessionId)) {
            $this->refreshSession($sessionId);
            return ['status' => 'alive'];
        }

        return ['status' => 'expired'];
    }

    /**
     * Release a session
     */
    public function release(string $sessionId): void
    {
        // Remove from active users
        $this->redis->srem(self::QUEUE_ACTIVE_USERS, $sessionId);

        // Remove from waiting queue
        $this->redis->zrem(self::QUEUE_WAITING, $sessionId);

        // Remove session
        $this->redis->del(self::QUEUE_SESSION . $sessionId);
    }

    /**
     * Get queue statistics
     */
    public function getStats(): array
    {
        return [
            'active_users' => $this->redis->scard(self::QUEUE_ACTIVE_USERS),
            'waiting_users' => $this->redis->zcard(self::QUEUE_WAITING),
            'max_concurrent_users' => $this->maxConcurrentUsers,
            'queue_enabled' => $this->queueEnabled,
        ];
    }

    /**
     * Check if a new session can be activated
     */
    private function canActivate(): bool
    {
        if (!$this->queueEnabled) {
            return true;
        }

        return $this->redis->scard(self::QUEUE_ACTIVE_USERS) < $this->maxConcurrentUsers;
    }

    /**
     * Activate a session
     */
    private function activateSession(string $sessionId): void
    {
        $this->redis->sadd(self::QUEUE_ACTIVE_USERS, $sessionId);
        $this->redis->set(self::QUEUE_SESSION . $sessionId, (string) time(), self::SESSION_TTL);
        $this->redis->zrem(self::QUEUE_WAITING, $sessionId);
    }

    /**
     * Add session to waiting queue
     */
    private function addToQueue(string $sessionId): void
    {
        $this->redis->zadd(self::QUEUE_WAITING, microtime(true), $sessionId);
    }

    /**
     * Refresh session TTL
     */
    private function refreshSession(string $sessionId): void
    {
        $this->redis->expire(self::QUEUE_SESSION . $sessionId, self::SESSION_TTL);
    }

    /**
     * Try to activate next user in queue
     */
    public function tryActivateNext(): void
    {
        if (!$this->canActivate()) {
            return;
        }

        $nextUsers = $this->redis->zrange(self::QUEUE_WAITING, 0, 0);
        if (!empty($nextUsers)) {
            $this->activateSession($nextUsers[0]);
        }
    }

    /**
     * Cleanup expired sessions
     */
    public function cleanup(): int
    {
        $cleaned = 0;
        // This would need a list of all session keys
        // For production, you'd want to implement this with a Redis SCAN
        return $cleaned;
    }

    /**
     * Clear the entire queue (admin action)
     */
    public function clearQueue(): void
    {
        // Get all waiting users
        $waitingUsers = $this->redis->zrange(self::QUEUE_WAITING, 0, -1);

        // Remove all from queue
        foreach ($waitingUsers as $sessionId) {
            $this->redis->zrem(self::QUEUE_WAITING, $sessionId);
        }
    }

    /**
     * Kick a user from the system
     */
    public function kickUser(string $sessionId): void
    {
        $this->release($sessionId);
    }
}
