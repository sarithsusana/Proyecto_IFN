<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subparcela;
use App\Models\Conglomerado;
use Illuminate\Http\Request;

class SubparcelaController extends Controller
{
    public function index(Request $request) {
        $q = Subparcela::with('conglomerado:id,codigo');
        if ($cid = $request->get('conglomerado_id')) {
            $q->where('conglomerado_id', $cid);
        }
        return $q->orderBy('created_at','desc')->paginate(20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'codigo' => 'required|alpha_dash|unique:subparcelas,codigo',
            'estado' => 'required|in:activo,inactivo,pendiente',
            'coberturas' => 'required|string',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'conglomerado_id' => 'required|exists:conglomerados,id',
        ]);
        return Subparcela::create($data);
    }

    public function update(Request $request, Subparcela $subparcela) {
        $data = $request->validate([
            'estado' => 'sometimes|required|in:activo,inactivo,pendiente',
            'coberturas' => 'sometimes|required|string',
            'latitud' => 'sometimes|required|numeric|between:-90,90',
            'longitud' => 'sometimes|required|numeric|between:-180,180',
            'conglomerado_id' => 'sometimes|required|exists:conglomerados,id',
        ]);
        $subparcela->update($data);
        return $subparcela->fresh();
    }

    public function destroy(Subparcela $subparcela) {
        $subparcela->delete();
        return response()->json(['ok'=>true]);
    }

    public function listByConglomerado(Conglomerado $conglomerado) {
        return $conglomerado->subparcelas()->select('id','codigo')->orderBy('codigo')->get();
    }
}
