<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ConglomeradoController;
use App\Http\Controllers\Api\SubparcelaController;
use App\Http\Controllers\Api\ArbolController;

Route::get('/ping', fn () => response()->json(['pong' => true]));

Route::apiResource('conglomerados', ConglomeradoController::class);
Route::apiResource('subparcelas', SubparcelaController::class);
Route::apiResource('arboles', ArbolController::class);

Route::get('conglomerados/{conglomerado}/subparcelas', [SubparcelaController::class, 'byConglomerado']);
