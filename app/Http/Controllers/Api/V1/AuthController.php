<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'documento'  => 'required|string',
            'contrasena' => 'required|string',
        ]);

        $user = Persona::where('documento', $data['documento'])->first();
        if (!$user || !Hash::check($data['contrasena'], $user->contrasena)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }
        $token = $user->createToken('api')->plainTextToken;

        return [
            'token' => $token,
            'user'  => [
                'documento' => $user->documento,
                'nombre'    => $user->nombre_completo,
                'correo'    => $user->correo,
                'rol'       => $user->getRoleNames()->first(),
            ],
        ];
    }

    public function me(Request $request)
    {
        $u = $request->user();
        return [
            'documento' => $u->documento,
            'nombre'    => $u->nombre_completo,
            'correo'    => $u->correo,
            'rol'       => $u->getRoleNames()->first(),
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ['message' => 'Sesión cerrada'];
    }
}
