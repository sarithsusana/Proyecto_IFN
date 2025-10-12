<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subparcela;
use App\Models\Conglomerado;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubparcelaController extends Controller
{
    public function index(Request $request)
    {
        $q = Subparcela::with('conglomerado:id,codigo,municipio')->latest();

        if ($search = $request->get('search')) {
            $q->where(function($w) use ($search){
                $w->where('codigo','like',"%{$search}%")
                  ->orWhere('coberturas','like',"%{$search}%");
            })->orWhereHas('conglomerado', function($w) use ($search){
                $w->where('codigo','like',"%{$search}%")
                  ->orWhere('municipio','like',"%{$search}%");
            });
        }

        return $q->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo'          => ['required','string','max:50','regex:/^[A-Za-z0-9\-]+$/'],
            'estado'          => ['required', Rule::in(['activo','inactivo','pendiente'])],
            'coberturas'      => ['required','string','max:255'],
            'latitud'         => ['required','numeric','between:-90,90'],
            'longitud'        => ['required','numeric','between:-180,180'],
            'conglomerado_id' => ['required','exists:conglomerados,id'],
        ]);

        // unicidad: código dentro del conglomerado
        $exists = Subparcela::where('conglomerado_id',$data['conglomerado_id'])
                    ->where('codigo',$data['codigo'])->exists();
        if ($exists) {
            return response()->json([
                'message' => 'El código ya existe en ese conglomerado'
            ], 422);
        }

        $sp = Subparcela::create($data);
        return response()->json($sp->load('conglomerado:id,codigo'), 201);
    }

    public function show(Subparcela $subparcela)
    {
        return $subparcela->load('conglomerado:id,codigo,municipio');
    }

    public function update(Request $request, Subparcela $subparcela)
    {
        $data = $request->validate([
            'codigo'          => ['sometimes','string','max:50','regex:/^[A-Za-z0-9\-]+$/',
                function($attr,$value,$fail) use ($request,$subparcela){
                    $congId = $request->get('conglomerado_id', $subparcela->conglomerado_id);
                    $dup = Subparcela::where('conglomerado_id',$congId)
                          ->where('codigo',$value)
                          ->where('id','!=',$subparcela->id)
                          ->exists();
                    if ($dup) $fail('El código ya existe en ese conglomerado.');
                }
            ],
            'estado'          => ['sometimes', Rule::in(['activo','inactivo','pendiente'])],
            'coberturas'      => ['sometimes','string','max:255'],
            'latitud'         => ['sometimes','numeric','between:-90,90'],
            'longitud'        => ['sometimes','numeric','between:-180,180'],
            'conglomerado_id' => ['sometimes','exists:conglomerados,id'],
        ]);

        $subparcela->update($data);
        return $subparcela->load('conglomerado:id,codigo');
    }

    public function destroy(Subparcela $subparcela)
    {
        $subparcela->delete();
        return response()->noContent();
    }

    /** GET /api/conglomerados/{conglomerado}/subparcelas */
    public function byConglomerado(Conglomerado $conglomerado)
    {
        return $conglomerado->subparcelas()
            ->select('id','codigo')
            ->orderBy('codigo')
            ->get();
    }
}
