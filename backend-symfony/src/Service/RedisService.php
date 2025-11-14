<?php

namespace App\Service;

use Predis\Client;

class RedisService
{
    private Client $redis;

    public function __construct(string $redisUrl)
    {
        $this->redis = new Client($redisUrl);
    }

    /**
     * Get a value from Redis
     */
    public function get(string $key): ?string
    {
        $value = $this->redis->get($key);
        return $value === null ? null : (string) $value;
    }

    /**
     * Set a value in Redis
     */
    public function set(string $key, string $value, ?int $ttl = null): void
    {
        if ($ttl !== null) {
            $this->redis->setex($key, $ttl, $value);
        } else {
            $this->redis->set($key, $value);
        }
    }

    /**
     * Delete a key from Redis
     */
    public function del(string $key): void
    {
        $this->redis->del([$key]);
    }

    /**
     * Check if a key exists
     */
    public function exists(string $key): bool
    {
        return (bool) $this->redis->exists($key);
    }

    /**
     * Set expiration on a key
     */
    public function expire(string $key, int $seconds): void
    {
        $this->redis->expire($key, $seconds);
    }

    /**
     * Add member to a set
     */
    public function sadd(string $key, string ...$members): void
    {
        $this->redis->sadd($key, $members);
    }

    /**
     * Remove member from a set
     */
    public function srem(string $key, string ...$members): void
    {
        $this->redis->srem($key, $members);
    }

    /**
     * Check if member is in set
     */
    public function sismember(string $key, string $member): bool
    {
        return (bool) $this->redis->sismember($key, $member);
    }

    /**
     * Get cardinality (count) of a set
     */
    public function scard(string $key): int
    {
        return (int) $this->redis->scard($key);
    }

    /**
     * Add member to sorted set
     */
    public function zadd(string $key, float $score, string $member): void
    {
        $this->redis->zadd($key, [$member => $score]);
    }

    /**
     * Remove member from sorted set
     */
    public function zrem(string $key, string $member): void
    {
        $this->redis->zrem($key, $member);
    }

    /**
     * Get rank of member in sorted set
     */
    public function zrank(string $key, string $member): ?int
    {
        $rank = $this->redis->zrank($key, $member);
        return $rank === null ? null : (int) $rank;
    }

    /**
     * Get range from sorted set
     */
    public function zrange(string $key, int $start, int $stop): array
    {
        return $this->redis->zrange($key, $start, $stop);
    }

    /**
     * Get cardinality of sorted set
     */
    public function zcard(string $key): int
    {
        return (int) $this->redis->zcard($key);
    }

    /**
     * Increment a value
     */
    public function incr(string $key): int
    {
        return (int) $this->redis->incr($key);
    }

    /**
     * Decrement a value
     */
    public function decr(string $key): int
    {
        return (int) $this->redis->decr($key);
    }
}
