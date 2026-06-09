<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private JwtService $jwt) {}

    public function login(Request $request): JsonResponse
    {
        $userName = strtolower(trim((string) $request->input('userName', '')));
        $password = (string) $request->input('password', '');

        if ($userName === '' || $password === '') {
            return response()->json(['message' => 'Usuario y contraseña requeridos'], 400);
        }

        $user = User::where('email', $userName)->first();
        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $role = JwtService::mapDbRoleToJwt($user->role);
        $token = $this->jwt->issue($user->email, $role, $user->id);

        $isProduction = app()->environment('production');
        $cookie = cookie(
            config('innova.jwt_cookie'),
            $token,
            config('innova.jwt_ttl_hours') * 60,
            '/',
            null,
            $isProduction,
            true,
            false,
            $isProduction ? 'none' : 'lax'
        );

        return response()
            ->json(['token' => $token, 'userName' => $user->email, 'role' => $role])
            ->withCookie($cookie);
    }

    public function logout(): JsonResponse
    {
        $isProduction = app()->environment('production');
        $cookie = cookie()->forget(
            config('innova.jwt_cookie'),
            '/',
            null,
            $isProduction,
            true,
            false,
            $isProduction ? 'none' : 'lax'
        );

        return response()->json(['success' => true])->withCookie($cookie);
    }

    public function me(Request $request): JsonResponse
    {
        $auth = $request->attributes->get('auth');
        if (!$auth) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        return response()->json([
            'userName' => $auth['name'],
            'role' => $auth['role'],
        ]);
    }

    public function listAdmins(): JsonResponse
    {
        $admins = User::where('role', 'administrador')
            ->get(['id', 'email', 'role']);

        return response()->json($admins);
    }

    public function createAdmin(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $password = (string) $request->input('password', '');

        if ($email === '' || $password === '') {
            return response()->json(['message' => 'Usuario y contraseña requeridos'], 400);
        }

        if (User::where('email', $email)->exists()) {
            return response()->json(['message' => 'El usuario ya está registrado'], 409);
        }

        $admin = User::create([
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'administrador',
        ]);

        return response()->json([
            'id' => $admin->id,
            'email' => $admin->email,
            'role' => $admin->role,
        ], 201);
    }

    public function deleteAdmin(int $id): JsonResponse
    {
        $admin = User::find($id);
        if (!$admin) {
            return response()->json(['message' => 'Admin no encontrado'], 404);
        }

        if ($admin->role !== 'administrador') {
            return response()->json(['message' => 'El usuario no es un administrador'], 400);
        }

        $admin->delete();

        return response()->json(['success' => true]);
    }
}
