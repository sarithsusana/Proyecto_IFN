<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            // 1) Validar datos que vienen del formulario
            $cred = $request->validate([
                'email'    => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);

            // 2) BUSCAR EN LA TABLA PERSONA POR LA COLUMNA CORREO
            $persona = DB::table('persona')
                ->where('correo', $cred['email'])
                ->first();

            if (!$persona) {
                return response()->json([
                    'ok'      => false,
                    'message' => 'Usuario y/o contraseña incorrectos.',
                ], 401);
            }

            // 3) Comparar contraseña (columna "contraseña" en la tabla)
            $datosPersona = (array) $persona;
            $passwordBD   = $datosPersona['contraseña'] ?? null;

            if ($passwordBD !== $cred['password']) {
                return response()->json([
                    'ok'      => false,
                    'message' => 'Usuario y/o contraseña incorrectos.',
                ], 401);
            }

            // 4) Normalizar rol para el frontend
            $rolBD = strtolower($persona->tipo_usuario);

            if (str_starts_with($rolBD, 'admin')) {
                $rolFront = 'Administrador';
            } elseif (str_starts_with($rolBD, 'coor')) {
                $rolFront = 'Coordinador';
            } elseif (str_starts_with($rolBD, 'bot')) {
                $rolFront = 'Botanico'; // sin tilde, como en el front
            } else {
                $rolFront = 'Tecnico';
            }

            return response()->json([
                'ok'   => true,
                'user' => [
                    'email'  => $persona->correo,
                    'nombre' => $persona->nombre_completo,
                    'role'   => $rolFront,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error interno en el servidor',
            ], 500);
        }
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Sesión cerrada']);
    }
}
