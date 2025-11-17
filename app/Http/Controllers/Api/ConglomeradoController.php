<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Conglomerado;

class ConglomeradoController extends Controller
{
    public function store(Request $request)
    {
        try {

            //------------------------------------
            // 1) NORMALIZAR INPUTS
            //------------------------------------
            $input = $request->all();

            // Normalizar números decimales (coma → punto)
            foreach (['latitud', 'longitud', 'altitud'] as $campo) {
                if (isset($input[$campo]) && $input[$campo] !== '') {
                    $input[$campo] = str_replace(',', '.', $input[$campo]);
                } else {
                    $input[$campo] = null;
                }
            }

            //------------------------------------
            // 2) VALIDACIÓN (alineada con la BD)
            //------------------------------------
            $validator = Validator::make($input, [
                'codigo'        => 'required|string|max:50',
                'region'        => 'required|string|max:100',

                'fecha_inicio'  => 'required|date',
                'fecha_final'   => 'required|date|after_or_equal:fecha_inicio',

                'brigada'       => 'required|string|max:100',
                'estado'        => 'required|in:iniciando,Finalizado',

                'latitud'       => 'required|numeric',
                'longitud'      => 'required|numeric',
                'altitud'       => 'nullable|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'ok'          => false,
                    'message'     => 'Error de validación al crear el conglomerado',
                    'errors'      => $validator->errors(),
                    'debug_input' => $input,
                ], 422);
            }

            //------------------------------------
            // 3) CREAR CONGLOMERADO
            //------------------------------------
            $conglomerado = new Conglomerado();

            $conglomerado->codigo_conglomerado = $input['codigo'];
            $conglomerado->region              = $input['region'];
            $conglomerado->fecha_inicio        = $input['fecha_inicio'];
            $conglomerado->fecha_final         = $input['fecha_final'];
            $conglomerado->nombre_brigada      = $input['brigada'];
            $conglomerado->estado              = $input['estado'];
            $conglomerado->latitud             = $input['latitud'];
            $conglomerado->longitud            = $input['longitud'];
            $conglomerado->altitud             = $input['altitud'];

            // 🔹 Correo: solo si hay usuario autenticado
            $user = $request->user(); // usuario autenticado (Sanctum, etc.)
            $conglomerado->correo = $user?->correo ?? null;

            $conglomerado->save();

            //------------------------------------
            // 4) RESPUESTA
            //------------------------------------
            return response()->json([
                'ok'           => true,
                'message'      => 'Conglomerado creado correctamente',
                'conglomerado' => $conglomerado,
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error interno al crear el conglomerado',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
