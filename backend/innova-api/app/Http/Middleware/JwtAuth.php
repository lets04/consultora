<?php

namespace App\Http\Middleware;

use App\Services\JwtService;
use Closure;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    public function __construct(private JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $decoded = $this->jwt->decode($token);
            $role = $decoded->role ?? null;
            $name = $decoded->name ?? $decoded->sub ?? null;

            if (!$name || !in_array($role, ['admin', 'gerente'], true)) {
                return response()->json(['message' => 'Token inválido'], 401);
            }

            $request->attributes->set('auth', [
                'sub' => $decoded->sub ?? $name,
                'name' => $name,
                'role' => $role,
                'userId' => $decoded->userId ?? null,
            ]);
        } catch (ExpiredException|SignatureInvalidException|\UnexpectedValueException|\DomainException) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return $request->cookie(config('innova.jwt_cookie'));
    }
}
