<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\Api\ConglomeradoController;
use App\Http\Controllers\Api\SubparcelaController;
use App\Http\Controllers\Api\ArbolController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\ReporteArbolController;



Route::post('/login', function (Request $request) {

    try {
        // Validar datos del formulario
        $cred = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Buscar persona por correo
        $persona = DB::table('persona')
            ->where('correo', $cred['email'])
            ->first();

        if (!$persona) {
            return response()->json([
                'ok'      => false,
                'message' => 'Usuario y/o contraseña incorrectos',
            ], 401);
        }

        // Comparar contraseña en claro
        if (($persona->contraseña ?? null) !== $cred['password']) {
            return response()->json([
                'ok'      => false,
                'message' => 'Usuario y/o contraseña incorrectos',
            ], 401);
        }

        // Mapear rol para el front
        $rolBD = strtolower($persona->tipo_usuario ?? '');

        if (str_starts_with($rolBD, 'admin')) {
            $rolFront = 'Administrador';
        } elseif (str_starts_with($rolBD, 'coor')) {
            $rolFront = 'Coordinador';
        } elseif (str_starts_with($rolBD, 'bot')) {
            $rolFront = 'Botanico';
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
});


/* ============================
 * PERSONAS (GESTIÓN DE USUARIOS)
 * Identificador = correo (PK)
 * ============================ */

Route::get('/personas',              [PersonaController::class, 'index']);
Route::get('/personas/{correo}',     [PersonaController::class, 'show']);
Route::post('/personas',             [PersonaController::class, 'store']);
Route::put('/personas/{correo}',     [PersonaController::class, 'update']);
Route::delete('/personas/{correo}',  [PersonaController::class, 'destroy']);


/* =====================
 * CONGLOMERADOS
 * ===================== */

Route::post('/conglomerados', [ConglomeradoController::class, 'store']);
Route::get('/conglomerados',      [ConglomeradoController::class, 'index']);
Route::get('/conglomerados/list', [ConglomeradoController::class, 'index']);


Route::get(
    '/conglomerados/{codigo}/subparcelas',
    [SubparcelaController::class, 'listByConglomerado']
);


/* =====================
 * SUBPARCELAS
 * ===================== */

Route::post('/subparcelas', [SubparcelaController::class, 'store']);
Route::get('/subparcelas',          [SubparcelaController::class, 'index']);
Route::get('/subparcelas/{id}',     [SubparcelaController::class, 'show']);
Route::put('/subparcelas/{id}',     [SubparcelaController::class, 'update']);
Route::delete('/subparcelas/{id}',  [SubparcelaController::class, 'destroy']);


/* =====================
 * ÁRBOLES (CRUD)
 * ===================== */

Route::get('/arboles',      [ArbolController::class, 'index']);
Route::get('/arboles/{id}', [ArbolController::class, 'show']);
Route::post('/arboles',     [ArbolController::class, 'store']);
Route::put('/arboles/{id}',    [ArbolController::class, 'update']);
Route::delete('/arboles/{id}', [ArbolController::class, 'destroy']);

Route::get('/arboles-pendientes',    [ArbolController::class, 'pendientes']);
Route::put('/arboles/{id}/validar',  [ArbolController::class, 'validar']);

/* =====================
 * REPORTES DE ÁRBOLES
 * ===================== */

Route::get('/reportes/arboles', [ReporteArbolController::class, 'index']);
Route::get('/reportes/stats',   [ReporteArbolController::class, 'stats']);
