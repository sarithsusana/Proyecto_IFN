<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conglomerado;
use Illuminate\Http\Request;

class ConglomeradoController extends Controller
{
    public function index(Request $request) {
        $q = Conglomerado::query();

        if ($s = $request->get('search')) {
            $q->where(function($qq) use ($s) {
                $qq->where('codigo','like',"%$s%")
                   ->orWhere('region','like',"%$s%")
                   ->orWhere('municipio','like',"%$s%");
            });
        }

        return $q->orderBy('created_at','desc')->paginate(20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'codigo' => 'required|alpha_dash|unique:conglomerados,codigo',
            'region' => 'required|string',
            'municipio' => 'required|string',
            'vereda' => 'required|string',
            'fecha' => 'required|date',
            'brigada' => 'required|string',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'observaciones' => 'nullable|string|max:500',
            'adjuntos' => 'nullable|array',
        ]);
        return Conglomerado::create($data);
    }

    public function update(Request $request, Conglomerado $conglomerado) {
        $data = $request->validate([
            'region' => 'sometimes|required|string',
            'municipio' => 'sometimes|required|string',
            'vereda' => 'sometimes|required|string',
            'fecha' => 'sometimes|required|date',
            'brigada' => 'sometimes|required|string',
            'latitud' => 'sometimes|required|numeric|between:-90,90',
            'longitud' => 'sometimes|required|numeric|between:-180,180',
            'observaciones' => 'nullable|string|max:500',
            'adjuntos' => 'nullable|array',
        ]);
        $conglomerado->update($data);
        return $conglomerado->fresh();
    }

    public function destroy(Conglomerado $conglomerado) {
        $conglomerado->delete();
        return response()->json(['ok'=>true]);
    }

    public function list() {
        return Conglomerado::select('id','codigo')->orderBy('codigo')->get();
    }
}
