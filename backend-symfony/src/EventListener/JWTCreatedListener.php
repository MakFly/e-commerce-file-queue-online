<?php

declare(strict_types=1);

namespace App\EventListener;

use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * JWT Created Listener
 *
 * Adds refresh token to JWT authentication response
 */
class JWTCreatedListener
{
    public function __construct(
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private RefreshTokenManagerInterface $refreshTokenManager,
        private int $ttl
    ) {}

    /**
     * Add refresh token to authentication response
     */
    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof UserInterface) {
            return;
        }

        // Generate refresh token
        $refreshTokenString = $this->refreshTokenGenerator->createForUserWithTtl(
            $user,
            $this->ttl
        );

        // Save refresh token to database
        $this->refreshTokenManager->save($refreshTokenString);

        // Add refresh token to response data
        $data = $event->getData();
        $data['refresh_token'] = $refreshTokenString->getRefreshToken();
        $data['refresh_token_expiration'] = $refreshTokenString->getValid()->getTimestamp();

        $event->setData($data);
    }
}
