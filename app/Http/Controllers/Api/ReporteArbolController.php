<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteArbolController extends Controller
{
    /**
     * Lista de árboles para la pantalla de reportes.
     * Devuelve el formato que espera app.js (renderReportes).
     */
    public function index(Request $request)
    {
        try {
            // Ajusta nombres de tabla/columnas según tu esquema real
            $query = DB::table('arbol as a')
                ->leftJoin('conglomerado as c', 'a.codigo_conglomerado', '=', 'c.codigo')
                ->select(
                    'a.id',
                    'a.codigo_conglomerado as conglomerado',
                    'a.codigo_subparcela as subparcela',
                    'a.nombre_cientifico',
                    'a.estado',
                    'a.validado_por',
                    DB::raw('DATE(a.fecha_registro) as fecha'),
                    'a.dap',
                    'a.altura',
                    'c.municipio'
                );

            // Si quisieras filtrar desde el backend, aquí podrías leer
            // $request->fecha_desde, fecha_hasta, etc.
            // Por ahora devolvemos todo y el filtro lo hace app.js

            $rows = $query->orderBy('a.id', 'asc')->get();

            // Adaptar nombres de propiedades a lo que usa el front
            $data = $rows->map(function ($r) {
                return [
                    'id'              => $r->id,
                    'conglomerado'    => $r->conglomerado,
                    'subparcela'      => $r->subparcela,
                    'nombreCientifico'=> $r->nombre_cientifico,
                    'estado'          => $r->estado,
                    'validadoPor'     => $r->validado_por,
                    'fecha'           => $r->fecha,
                    'dap'             => $r->dap,
                    'altura'          => $r->altura,
                    // municipio viene por si lo quieres usar directo
                    'municipio'       => $r->municipio,
                ];
            });

            return response()->json($data);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error obteniendo datos de reportes',
            ], 500);
        }
    }

    /**
     * Estadísticas generales para el modal de "Estadísticas del IFN".
     */
    public function stats()
    {
        try {
            // Ajusta nombres de tabla/columnas según tu BD
            $totalArboles = DB::table('arbol')->count();

            $especiesUnicas = DB::table('arbol')
                ->distinct('nombre_cientifico')
                ->count('nombre_cientifico');

            $validados = DB::table('arbol')
                ->where('estado', 'validado')
                ->count();

            $pendientes = DB::table('arbol')
                ->where('estado', 'pendiente')
                ->count();

            $conglomeradosActivos = DB::table('conglomerado')
                ->where('estado', 'activo')
                ->count();

            $dapPromedio = round((float) DB::table('arbol')->avg('dap'), 2);
            $alturaPromedio = round((float) DB::table('arbol')->avg('altura'), 2);

            return response()->json([
                'ok'   => true,
                'data' => [
                    'totalArboles'       => $totalArboles,
                    'especiesUnicas'     => $especiesUnicas,
                    'validados'          => $validados,
                    'pendientes'         => $pendientes,
                    'conglomeradosActivos' => $conglomeradosActivos,
                    'dapPromedio'        => $dapPromedio,
                    'alturaPromedio'     => $alturaPromedio,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'      => false,
                'message' => 'Error obteniendo estadísticas',
            ], 500);
        }
    }
}
