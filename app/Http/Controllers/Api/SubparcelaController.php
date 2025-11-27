<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subparcela;
use App\Models\Conglomerado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubparcelaController extends Controller
{
    // LISTAR SUBPARCELAS (con filtros opcionales)
    public function index(Request $request)
    {
        $query = Subparcela::query();

        // Filtrar por código de conglomerado si llega ?conglomerado=XXX
        if ($request->filled('conglomerado')) {
            $query->where('codigo_conglomerado', $request->conglomerado);
        }

        // Filtrar por código de subparcela si llega ?codigo=XXX
        if ($request->filled('codigo')) {
            $query->where('codigo_subparcela', $request->codigo);
        }

        $subparcelas = $query
            ->orderBy('codigo_conglomerado')
            ->orderBy('numero_subparcela')
            ->get();

        return response()->json([
            'ok'         => true,
            'subparcelas'=> $subparcelas,
        ]);
    }

    // VER UNA SUBPARCELA POR ID
    public function show($id)
    {
        $subparcela = Subparcela::find($id);

        if (!$subparcela) {
            return response()->json([
                'ok'      => false,
                'message' => 'Subparcela no encontrada',
            ], 404);
        }

        return response()->json([
            'ok'         => true,
            'subparcela' => $subparcela,
        ]);
    }

    // CREAR SUBPARCELA
    public function store(Request $request)
    {
        $input = $request->all();

        // Normalizar fecha (por si viene en otro formato del front)
        // Se espera yyyy-mm-dd desde el <input type="date">
        if (!empty($input['fecha_levantamiento'])) {
            $input['fecha_levantamiento'] = $input['fecha_levantamiento'];
        }

        // Validación alineada con la tabla
        $validator = Validator::make($input, [
            'codigo_conglomerado' => 'required|string|exists:conglomerado,codigo_conglomerado',
            'numero_subparcela'   => 'required|integer|between:1,5',
            'codigo_subparcela'   => 'required|string|max:50|unique:subparcela,codigo_subparcela',
            'fecha_levantamiento' => 'required|date',
            'cobertura'           => 'required|string|max:100',
            'alteraciones'        => 'nullable|string|max:255',
            'observaciones'       => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok'          => false,
                'message'     => 'Error de validación al crear la subparcela',
                'errors'      => $validator->errors(),
                'debug_input' => $input,
            ], 422);
        }

        // Obtener la brigada desde el conglomerado (FK NOT NULL en tabla subparcela)
        $cong = Conglomerado::where('codigo_conglomerado', $input['codigo_conglomerado'])->first();

        if (!$cong) {
            return response()->json([
                'ok'      => false,
                'message' => 'Conglomerado no encontrado para la subparcela',
            ], 422);
        }

        $subparcela = new Subparcela();
        $subparcela->codigo_conglomerado = $input['codigo_conglomerado'];
        $subparcela->nombre_brigada      = $cong->nombre_brigada;
        $subparcela->fecha_levantamiento = $input['fecha_levantamiento'];
        $subparcela->numero_subparcela   = $input['numero_subparcela'];
        $subparcela->codigo_subparcela   = $input['codigo_subparcela'];
        $subparcela->cobertura           = $input['cobertura'];
        $subparcela->alteraciones        = $input['alteraciones'] ?? null;
        $subparcela->observaciones       = $input['observaciones'] ?? null;

        $subparcela->save();

        return response()->json([
            'ok'         => true,
            'message'    => 'Subparcela creada correctamente',
            'subparcela' => $subparcela,
        ], 201);
    }

    //ACTUALIZAR SUBPARCELA
    public function update(Request $request, $id)
    {
        $subparcela = Subparcela::find($id);

        if (!$subparcela) {
            return response()->json([
                'ok'      => false,
                'message' => 'Subparcela no encontrada',
            ], 404);
        }

        $input = $request->all();

        $validator = Validator::make($input, [
            // No dejamos cambiar código de conglomerado ni código_subparcela
            'fecha_levantamiento' => 'sometimes|required|date',
            'numero_subparcela'   => 'sometimes|required|integer|between:1,5',
            'cobertura'           => 'sometimes|required|string|max:100',
            'alteraciones'        => 'nullable|string|max:255',
            'observaciones'       => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok'          => false,
                'message'     => 'Error de validación al actualizar la subparcela',
                'errors'      => $validator->errors(),
                'debug_input' => $input,
            ], 422);
        }

        if (isset($input['fecha_levantamiento'])) {
            $subparcela->fecha_levantamiento = $input['fecha_levantamiento'];
        }
        if (isset($input['numero_subparcela'])) {
            $subparcela->numero_subparcela = $input['numero_subparcela'];
        }
        if (isset($input['cobertura'])) {
            $subparcela->cobertura = $input['cobertura'];
        }
        if (array_key_exists('alteraciones', $input)) {
            $subparcela->alteraciones = $input['alteraciones'];
        }
        if (array_key_exists('observaciones', $input)) {
            $subparcela->observaciones = $input['observaciones'];
        }

        $subparcela->save();

        return response()->json([
            'ok'         => true,
            'message'    => 'Subparcela actualizada correctamente',
            'subparcela' => $subparcela,
        ]);
    }

    // ELIMINAR SUBPARCELA
    public function destroy($id)
    {
        $subparcela = Subparcela::find($id);

        if (!$subparcela) {
            return response()->json([
                'ok'      => false,
                'message' => 'Subparcela no encontrada',
            ], 404);
        }

        $subparcela->delete();

        return response()->json([
            'ok'      => true,
            'message' => 'Subparcela eliminada correctamente',
        ]);
    }

    //LISTAR SUBPARCELAS POR CÓDIGO DE CONGLOMERADO (para selects dependientes)
public function listByConglomerado($codigo)
{
    $subparcelas = \DB::table('subparcela')
        ->where('codigo_conglomerado', $codigo)
        ->where('numero_subparcela', '<=', 5)
        ->orderBy('numero_subparcela')
        ->get([
            'id_subparcela',
            'codigo_subparcela',
            'numero_subparcela',
        ]);

    return response()->json([
        'ok'          => true,
        'subparcelas' => $subparcelas,
    ]);
}


}
