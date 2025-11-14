<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private RefreshTokenManagerInterface $refreshTokenManager
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validate required fields
        if (!isset($data['email'], $data['password'], $data['name'])) {
            return $this->json([
                'message' => 'Missing required fields: email, password, name'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check if user already exists
        if ($this->userRepository->findByEmail($data['email'])) {
            return $this->json([
                'message' => 'User with this email already exists'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Create new user
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data['password'])
        );

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Generate access token
        $accessToken = $this->jwtManager->create($user);

        // Generate refresh token (TTL: 30 days = 2592000 seconds)
        $refreshTokenEntity = $this->refreshTokenGenerator->createForUserWithTtl($user, 2592000);
        $this->refreshTokenManager->save($refreshTokenEntity);

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => in_array('ROLE_ADMIN', $user->getRoles()) ? 'admin' : 'user',
            ],
            'token' => $accessToken,
            'refresh_token' => $refreshTokenEntity->getRefreshToken(),
            'refresh_token_expiration' => $refreshTokenEntity->getValid()->getTimestamp(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => in_array('ROLE_ADMIN', $user->getRoles()) ? 'admin' : 'user',
            'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        // Get refresh token from request to revoke it
        $data = json_decode($request->getContent(), true);

        if (isset($data['refresh_token'])) {
            $refreshToken = $this->refreshTokenManager->get($data['refresh_token']);

            if ($refreshToken) {
                $this->refreshTokenManager->delete($refreshToken);
            }
        }

        return $this->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
