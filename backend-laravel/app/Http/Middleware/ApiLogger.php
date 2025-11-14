<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiLogger
{
    /**
     * Handle an incoming request and log API calls.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        // Log incoming request
        $this->logRequest($request);

        // Process request
        $response = $next($request);

        // Calculate duration
        $duration = round((microtime(true) - $startTime) * 1000, 2); // milliseconds

        // Log response
        $this->logResponse($request, $response, $duration);

        return $response;
    }

    /**
     * Log the incoming request
     */
    private function logRequest(Request $request): void
    {
        $data = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->header('X-Session-Id'),
        ];

        // Log body for POST/PUT/PATCH (excluding sensitive data)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $body = $request->except(['password', 'password_confirmation', 'token', 'refresh_token']);
            if (!empty($body)) {
                $data['body'] = $body;
            }
        }

        Log::channel('api')->info('📥 API Request', $data);
    }

    /**
     * Log the response
     */
    private function logResponse(Request $request, Response $response, float $duration): void
    {
        $statusCode = $response->getStatusCode();
        $level = $this->getLogLevel($statusCode);

        $data = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'status' => $statusCode,
            'duration_ms' => $duration,
        ];

        // Add response body for errors (excluding sensitive data)
        if ($statusCode >= 400) {
            $content = $response->getContent();
            if ($content) {
                $decodedContent = json_decode($content, true);
                if ($decodedContent) {
                    // Exclude sensitive fields from error logs
                    unset($decodedContent['token'], $decodedContent['refresh_token']);
                    $data['response'] = $decodedContent;
                }
            }
        }

        $emoji = $this->getStatusEmoji($statusCode);

        Log::channel('api')->log($level, "{$emoji} API Response", $data);
    }

    /**
     * Get log level based on status code
     */
    private function getLogLevel(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => 'error',
            $statusCode >= 400 => 'warning',
            default => 'info',
        };
    }

    /**
     * Get emoji based on status code
     */
    private function getStatusEmoji(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => '🔴',
            $statusCode >= 400 => '🟡',
            $statusCode >= 300 => '🔵',
            $statusCode >= 200 => '✅',
            default => '⚪',
        };
    }
}
