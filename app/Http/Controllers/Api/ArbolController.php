<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArbolController extends Controller
{
    
    //Listar árboles
    public function index()
    {
        // Usamos la tabla REAL "arbol" (singular)
        $arboles = DB::table('arbol')->get();

        return response()->json($arboles);
    }

    /**
     * Guardar árbol nuevo desde el front.
     * Recibe el payload que envías desde saveArbol() en app.js
     */
    public function store(Request $request)
    {
        // Validamos solo lo necesario para que no truene
        $data = $request->validate([
            'id_conglomerado'      => 'required|integer',
            'id_subparcela'        => 'required|integer',

            'codigo_conglomerado'  => 'required|string|max:100',
            'codigo_subparcela'    => 'required|string|max:100',

            'categoria'            => 'nullable|string|max:100',
            'distancia'            => 'nullable|numeric',

            'nombre_cientifico'    => 'nullable|string|max:255',
            'nombre_comun'         => 'nullable|string|max:255',
            'especie'              => 'nullable|string|max:255',

            'dap'                  => 'nullable|numeric',
            'altura_fuste'         => 'nullable|numeric',
            'altura_total'         => 'nullable|numeric',

            'uso_comun'            => 'nullable|string|max:255',
            'observaciones'        => 'nullable|string',
        ]);

        // Insertamos en la tabla REAL "arbol"
        $id = DB::table('arbol')->insertGetId([
            'id_conglomerado'   => $data['id_conglomerado'],
            'id_subparcela'     => $data['id_subparcela'],
            'categoria'         => $data['categoria']        ?? null,
            'distancia'         => $data['distancia']        ?? null,
            'nombre_cientifico' => $data['nombre_cientifico']?? null,
            'nombre_comun'      => $data['nombre_comun']     ?? null,
            'especie'           => $data['especie']          ?? null,
            'dap'               => $data['dap']              ?? null,
            'altura_fuste'      => $data['altura_fuste']     ?? null,
            'altura_total'      => $data['altura_total']     ?? null,
            'uso_comun'         => $data['uso_comun']        ?? null,
            'observaciones'     => $data['observaciones']    ?? null,
            'estado'            => 'pendiente', // siempre pendiente de validación
        ]);

        $arbol = DB::table('arbol')->where('id_arbol', $id)->first();

        return response()->json([
            'ok'    => true,
            'arbol' => $arbol,
        ]);
    }

    /**
     * Árboles pendientes de validación (para la tabla del botánico).
     *
     * Usa:
     *   tabla "arbol" (id_arbol, id_conglomerado, id_subparcela, nombre_cientifico, estado)
     *   tabla "conglomerado" (id_conglomerado, codigo_conglomerado)
     *   tabla "subparcela"   (id_subparcela, codigo_subparcela)
     */
    public function pendientes()
{
    $rows = DB::table('arbol as a')
        ->leftJoin('conglomerado as c', 'c.id_conglomerado', '=', 'a.id_conglomerado')
        ->leftJoin('subparcela as s', 's.id_subparcela', '=', 'a.id_subparcela')
        ->select(
            'a.id_arbol',
            'c.codigo_conglomerado',
            's.codigo_subparcela',
            'a.nombre_cientifico',
            'a.estado'
        )
        ->whereIn('a.estado', ['pendiente', 'pendiente_validacion'])
        ->orderBy('a.id_arbol')
        ->get();

    return response()->json($rows);
}


    /**
     * Validar un árbol (botánico).
     * El front le manda:
     *   - nombre_cientifico
     *   - observaciones_validacion (opcional)
     */
    public function validar(Request $request, $id)
    {
        $data = $request->validate([
            'nombre_cientifico'        => 'required|string|max:255',
            'observaciones_validacion' => 'nullable|string',
        ]);

        $arbol = DB::table('arbol')->where('id_arbol', $id)->first();

        if (!$arbol) {
            return response()->json([
                'ok'      => false,
                'message' => 'Árbol no encontrado',
            ], 404);
        }

        // concatenamos las observaciones de validación (si vienen)
        $observaciones = $arbol->observaciones;
        if (!empty($data['observaciones_validacion'])) {
            $extra = 'Validación: '.$data['observaciones_validacion'];
            $observaciones = $observaciones
                ? $observaciones.' | '.$extra
                : $extra;
        }

        DB::table('arbol')
            ->where('id_arbol', $id)
            ->update([
                'nombre_cientifico' => $data['nombre_cientifico'],
                'observaciones'     => $observaciones,
                'estado'            => 'validado',
            ]);

        $arbolActualizado = DB::table('arbol')->where('id_arbol', $id)->first();

        return response()->json([
            'ok'    => true,
            'arbol' => $arbolActualizado,
        ]);
    }
}
