<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            return response()->json(['message' => 'Credenciales inválidas'], 422);
        }

        $user = $request->user();
        $user->tokens()->delete();
        $token = $user->createToken('ifn-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'name'  => $user->name,
                'role'  => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()?->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request)
    {
        $u = $request->user();
        return response()->json([
            'id'    => $u->id,
            'email' => $u->email,
            'name'  => $u->name,
            'role'  => $u->role,
        ]);
    }
}
