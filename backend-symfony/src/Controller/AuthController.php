<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager
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

        // Generate tokens
        $accessToken = $this->jwtManager->create($user);
        $refreshToken = $this->generateRefreshToken($user);

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => in_array('ROLE_ADMIN', $user->getRoles()) ? 'admin' : 'user',
            ],
            'tokens' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'expiresIn' => 3600, // 1 hour
            ],
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

    #[Route('/refresh', name: 'refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['refreshToken'])) {
            return $this->json([
                'message' => 'Missing refresh token'
            ], Response::HTTP_BAD_REQUEST);
        }

        // In a real app, you'd validate the refresh token here
        // For now, we'll just generate a new access token
        // You should implement proper refresh token validation

        $user = $this->getUser();
        if (!$user) {
            return $this->json([
                'message' => 'Invalid refresh token'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $accessToken = $this->jwtManager->create($user);

        return $this->json([
            'accessToken' => $accessToken,
            'expiresIn' => 3600,
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // In a stateless JWT system, logout is handled client-side by removing the token
        // You could implement token blacklisting here if needed
        return $this->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Generate refresh token (placeholder - implement proper refresh token logic)
     */
    private function generateRefreshToken(UserInterface $user): string
    {
        // This is a placeholder. In production, implement proper refresh token generation
        // with database storage and validation
        return base64_encode(random_bytes(32));
    }
}
