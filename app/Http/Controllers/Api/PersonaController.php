<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonaController extends Controller
{
    /**
     * Lista todas las personas (para la tabla del admin).
     */
    public function index()
    {
        $personas = DB::table('persona')
            ->orderBy('fecha_creacion', 'asc')
            ->get();

        return response()->json([
            'ok'   => true,
            'data' => $personas,
        ]);
    }

    /**
     * Muestra una persona por correo (PK).
     */
    public function show($correo)
    {
        $persona = DB::table('persona')
            ->where('correo', $correo)
            ->first();

        if (!$persona) {
            return response()->json([
                'ok'      => false,
                'message' => 'Persona no encontrada.',
            ], 404);
        }

        return response()->json([
            'ok'   => true,
            'data' => $persona,
        ]);
    }

    /**
     * Crear una nueva persona (usuario).
     * El front envía: nombre, email, password, rol, documento.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'    => ['required', 'string', 'max:191'],
            'email'     => ['required', 'email', 'max:191'],
            'password'  => ['required', 'string', 'min:4'],
            'rol'       => ['required', 'string', 'max:50'],
            'documento' => ['nullable', 'string', 'max:50'],
        ]);

        // Verificar que no exista el correo
        if (DB::table('persona')->where('correo', $data['email'])->exists()) {
            return response()->json([
                'ok'      => false,
                'message' => 'Ya existe un usuario con ese correo.',
            ], 422);
        }

        // Insertar
        DB::table('persona')->insert([
            'correo'          => $data['email'],
            'nombre_completo' => $data['nombre'],
            'documento'       => $data['documento'],
            'contraseña'      => $data['password'],   // en claro, igual que el login actual
            'tipo_usuario'    => $data['rol'],
            'fecha_creacion'  => now(),
        ]);

        $persona = DB::table('persona')
            ->where('correo', $data['email'])
            ->first();

        return response()->json([
            'ok'      => true,
            'message' => 'Usuario creado correctamente.',
            'data'    => $persona,
        ], 201);
    }

    /**
     * Actualizar una persona existente.
     * URL: /api/personas/{correoActual}
     * El front puede mandar: nombre, email, rol, documento, password.
     */
    public function update(Request $request, $correo)
    {
        $persona = DB::table('persona')
            ->where('correo', $correo)
            ->first();

        if (!$persona) {
            return response()->json([
                'ok'      => false,
                'message' => 'Persona no encontrada.',
            ], 404);
        }

        $data = $request->validate([
            'nombre'    => ['sometimes', 'required', 'string', 'max:191'],
            'email'     => ['sometimes', 'required', 'email', 'max:191'],
            'rol'       => ['sometimes', 'required', 'string', 'max:50'],
            'documento' => ['nullable', 'string', 'max:50'],
            'password'  => ['nullable', 'string', 'min:4'],
        ]);

        $update = [];

        if (array_key_exists('nombre', $data)) {
            $update['nombre_completo'] = $data['nombre'];
        }

        if (array_key_exists('email', $data)) {
            // Si cambia el correo, validar que no exista otro
            $existe = DB::table('persona')
                ->where('correo', $data['email'])
                ->where('correo', '<>', $correo)
                ->exists();

            if ($existe) {
                return response()->json([
                    'ok'      => false,
                    'message' => 'Ya existe otro usuario con ese correo.',
                ], 422);
            }

            $update['correo'] = $data['email'];
        }

        if (array_key_exists('rol', $data)) {
            $update['tipo_usuario'] = $data['rol'];
        }

        if (array_key_exists('documento', $data)) {
            $update['documento'] = $data['documento'];
        }

        if (!empty($data['password'])) {
            $update['contraseña'] = $data['password'];
        }

        if (empty($update)) {
            return response()->json([
                'ok'      => true,
                'message' => 'No hay cambios para guardar.',
            ]);
        }

        DB::table('persona')
            ->where('correo', $correo)
            ->update($update);

        // Si cambiamos el correo, usar el nuevo para leer
        $correoFinal = $update['correo'] ?? $correo;

        $personaActualizada = DB::table('persona')
            ->where('correo', $correoFinal)
            ->first();

        return response()->json([
            'ok'      => true,
            'message' => 'Usuario actualizado correctamente.',
            'data'    => $personaActualizada,
        ]);
    }

    /**
     * Eliminar una persona.
     */
    public function destroy($correo)
    {
        $persona = DB::table('persona')
            ->where('correo', $correo)
            ->first();

        if (!$persona) {
            return response()->json([
                'ok'      => false,
                'message' => 'Persona no encontrada.',
            ], 404);
        }

        DB::table('persona')
            ->where('correo', $correo)
            ->delete();

        return response()->json([
            'ok'      => true,
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }
}
