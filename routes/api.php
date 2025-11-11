<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\ConglomeradoController;
use App\Http\Controllers\Api\SubparcelaController;
use App\Http\Controllers\Api\ArbolController;

/*
|-------------------------------
| Rutas públicas (login)
|-------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|-------------------------------
| Rutas protegidas
|-------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Sesión
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Listas básicas para selects
    Route::get('/conglomerados/list', [ConglomeradoController::class, 'list']);
    Route::get('/conglomerados/{conglomerado}/subparcelas', [SubparcelaController::class, 'listByConglomerado']);

    // Conglomerado (solo Coordinador)
    Route::middleware('role:Coordinador')->group(function () {
        Route::get('/conglomerados', [ConglomeradoController::class, 'index']);
        Route::post('/conglomerados', [ConglomeradoController::class, 'store']);
        Route::put('/conglomerados/{conglomerado}', [ConglomeradoController::class, 'update']);
        Route::delete('/conglomerados/{conglomerado}', [ConglomeradoController::class, 'destroy']);

        Route::get('/subparcelas', [SubparcelaController::class, 'index']);
        Route::post('/subparcelas', [SubparcelaController::class, 'store']);
        Route::put('/subparcelas/{subparcela}', [SubparcelaController::class, 'update']);
        Route::delete('/subparcelas/{subparcela}', [SubparcelaController::class, 'destroy']);
    });

    // Árboles (Técnico y Botánico pueden registrar)
    Route::middleware('role:Tecnico,Botanico,Coordinador')->group(function () {
        Route::get('/arboles', [ArbolController::class, 'index']);
        Route::post('/arboles', [ArbolController::class, 'store']);
        Route::put('/arboles/{arbol}', [ArbolController::class, 'update']);
        Route::delete('/arboles/{arbol}', [ArbolController::class, 'destroy']);
    });

    // Validación (solo Botánico)
    Route::middleware('role:Botanico,Coordinador')->group(function () {
        Route::post('/arboles/{arbol}/validar', [ArbolController::class, 'validar']);
    });

    // Reportes / Estadísticas
    Route::get('/reportes/arboles', [ArbolController::class, 'index']);
    Route::get('/reportes/stats', [ArbolController::class, 'stats']);
});
