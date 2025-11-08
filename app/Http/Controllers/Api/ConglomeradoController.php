<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conglomerado;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ConglomeradoController extends Controller
{
    public function index(Request $request)
    {
        $q = Conglomerado::query()->latest();

        if ($search = $request->get('search')) {
            $q->where(function($w) use ($search) {
                $w->where('codigo', 'like', "%$search%")
                  ->orWhere('municipio', 'like', "%$search%")
                  ->orWhere('region', 'like', "%$search%");
            });
        }

        return $q->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo' => ['required','string','max:50','regex:/^[A-Za-z0-9\-]+$/','unique:conglomerados,codigo'],
            'region' => ['required','string','max:100'],
            'municipio' => ['required','string','max:100'],
            'vereda' => ['required','string','max:100'],
            'fecha' => ['required','date','before_or_equal:today'],
            'brigada' => ['required','string','max:100'],
            'latitud' => ['required','numeric','between:-90,90'],
            'longitud' => ['required','numeric','between:-180,180'],
            'observaciones' => ['nullable','string','max:1000'],
            'adjuntos' => ['nullable','array'],
            'adjuntos.*' => ['string','max:255'],
        ]);

        $cong = Conglomerado::create($data);
        return response()->json($cong, 201);
    }

    public function show(Conglomerado $conglomerado)
    {
        return $conglomerado->load('subparcelas');
    }

    public function update(Request $request, Conglomerado $conglomerado)
    {
        $data = $request->validate([
            'codigo' => ['sometimes','string','max:50','regex:/^[A-Za-z0-9\-]+$/', Rule::unique('conglomerados','codigo')->ignore($conglomerado->id)],
            'region' => ['sometimes','string','max:100'],
            'municipio' => ['sometimes','string','max:100'],
            'vereda' => ['sometimes','string','max:100'],
            'fecha' => ['sometimes','date','before_or_equal:today'],
            'brigada' => ['sometimes','string','max:100'],
            'latitud' => ['sometimes','numeric','between:-90,90'],
            'longitud' => ['sometimes','numeric','between:-180,180'],
            'observaciones' => ['nullable','string','max:1000'],
            'adjuntos' => ['nullable','array'],
            'adjuntos.*' => ['string','max:255'],
        ]);

        $conglomerado->update($data);
        return $conglomerado;
    }

    public function destroy(Conglomerado $conglomerado)
    {
        $conglomerado->delete();
        return response()->noContent();
    }
}
