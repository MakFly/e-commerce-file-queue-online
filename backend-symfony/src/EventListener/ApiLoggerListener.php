<?php

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'kernel.request', priority: 0)]
#[AsEventListener(event: 'kernel.response', priority: 0)]
#[AsEventListener(event: 'kernel.exception', priority: 0)]
class ApiLoggerListener
{
    private array $requestTimes = [];

    public function __construct(
        private LoggerInterface $apiLogger
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Only log API routes
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        // Store start time
        $requestId = spl_object_id($request);
        $this->requestTimes[$requestId] = microtime(true);

        $data = [
            'method' => $request->getMethod(),
            'url' => $request->getRequestUri(),
            'ip' => $request->getClientIp(),
            'user_agent' => $request->headers->get('User-Agent'),
            'session_id' => $request->headers->get('X-Session-Id'),
        ];

        // Log body for POST/PUT/PATCH (excluding sensitive data)
        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH'])) {
            $body = $request->request->all();

            // Remove sensitive fields
            unset($body['password'], $body['password_confirmation'], $body['token'], $body['refresh_token']);

            if (!empty($body)) {
                $data['body'] = $body;
            }
        }

        $this->apiLogger->info('📥 API Request', $data);
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Only log API routes
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $response = $event->getResponse();
        $requestId = spl_object_id($request);
        $duration = isset($this->requestTimes[$requestId])
            ? round((microtime(true) - $this->requestTimes[$requestId]) * 1000, 2)
            : 0;

        // Clean up
        unset($this->requestTimes[$requestId]);

        $statusCode = $response->getStatusCode();
        $level = $this->getLogLevel($statusCode);
        $emoji = $this->getStatusEmoji($statusCode);

        $data = [
            'method' => $request->getMethod(),
            'url' => $request->getRequestUri(),
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

        $this->apiLogger->log($level, "{$emoji} API Response", $data);
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Only log API routes
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $exception = $event->getThrowable();
        $requestId = spl_object_id($request);
        $duration = isset($this->requestTimes[$requestId])
            ? round((microtime(true) - $this->requestTimes[$requestId]) * 1000, 2)
            : 0;

        // Clean up
        unset($this->requestTimes[$requestId]);

        $this->apiLogger->error('🔴 API Exception', [
            'method' => $request->getMethod(),
            'url' => $request->getRequestUri(),
            'duration_ms' => $duration,
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
        ]);
    }

    private function getLogLevel(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => 'error',
            $statusCode >= 400 => 'warning',
            default => 'info',
        };
    }

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
