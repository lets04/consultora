<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $auth = $request->attributes->get('auth');

        if (!$auth) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        if (!in_array($auth['role'], $roles, true)) {
            return response()->json(['message' => 'Sin permiso para este recurso'], 403);
        }

        return $next($request);
    }
}
