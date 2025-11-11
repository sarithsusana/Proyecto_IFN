<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user || !$user->activo || !in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return $next($request);
    }
}
