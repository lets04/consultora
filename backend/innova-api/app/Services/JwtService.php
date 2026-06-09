<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use stdClass;

class JwtService
{
    public function issue(string $email, string $role, int $userId): string
    {
        $now = time();
        $payload = [
            'sub' => $email,
            'name' => $email,
            'role' => $role,
            'userId' => $userId,
            'iss' => config('innova.jwt_issuer'),
            'aud' => config('innova.jwt_audience'),
            'iat' => $now,
            'exp' => $now + (config('innova.jwt_ttl_hours') * 3600),
        ];

        return JWT::encode($payload, config('innova.jwt_secret'), 'HS256');
    }

    public function decode(string $token): stdClass
    {
        return JWT::decode(
            $token,
            new Key(config('innova.jwt_secret'), 'HS256')
        );
    }

    public static function mapDbRoleToJwt(string $role): string
    {
        $normalized = strtolower(trim($role));

        return match ($normalized) {
            'administrador' => 'admin',
            'gerente' => 'gerente',
            default => throw new \InvalidArgumentException('Rol inválido: '.$role),
        };
    }
}
