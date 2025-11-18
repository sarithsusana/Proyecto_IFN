<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
     * El front envía: correo, nombre_completo, documento, password, tipo_usuario.
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'correo'          => ['required', 'email', 'max:191', 'unique:persona,correo'],
                'nombre_completo' => ['required', 'string', 'max:191'],
                'documento'       => ['required', 'string', 'max:50', 'unique:persona,documento'],
                'password'        => ['required', 'string', 'min:4'],
                'tipo_usuario'    => ['required', 'string', 'max:50'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error de validación.',
                'errors'  => $e->errors(),
            ], 422);
        }

        DB::table('persona')->insert([
            'correo'          => $data['correo'],
            'nombre_completo' => $data['nombre_completo'],
            'documento'       => $data['documento'],
            'contraseña'      => $data['password'],   // en claro, igual que el login actual
            'tipo_usuario'    => $data['tipo_usuario'],
            'fecha_creacion'  => now(),
        ]);

        $persona = DB::table('persona')
            ->where('correo', $data['correo'])
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
     * El front puede mandar: correo, nombre_completo, documento, password, tipo_usuario.
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

        try {
            $data = $request->validate([
                'correo'          => ['sometimes', 'required', 'email', 'max:191', 'unique:persona,correo,' . $correo . ',correo'],
                'nombre_completo' => ['sometimes', 'required', 'string', 'max:191'],
                'documento'       => ['sometimes', 'required', 'string', 'max:50', 'unique:persona,documento,' . $persona->documento . ',documento'],
                'password'        => ['nullable', 'string', 'min:4'],
                'tipo_usuario'    => ['sometimes', 'required', 'string', 'max:50'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error de validación.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $update = [];

        if (array_key_exists('correo', $data)) {
            $update['correo'] = $data['correo'];
        }

        if (array_key_exists('nombre_completo', $data)) {
            $update['nombre_completo'] = $data['nombre_completo'];
        }

        if (array_key_exists('documento', $data)) {
            $update['documento'] = $data['documento'];
        }

        if (array_key_exists('tipo_usuario', $data)) {
            $update['tipo_usuario'] = $data['tipo_usuario'];
        }

        if (!empty($data['password'])) {
            $update['contraseña'] = $data['password'];
        }

        if (empty($update)) {
            return response()->json([
                'ok'      => true,
                'message' => 'No hay cambios para guardar.',
                'data'    => $persona,
            ]);
        }

        DB::table('persona')
            ->where('correo', $correo)
            ->update($update);

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
