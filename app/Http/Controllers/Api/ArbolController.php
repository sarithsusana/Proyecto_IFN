<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arbol;
use App\Models\Subparcela;
use App\Models\Conglomerado;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArbolController extends Controller
{
    public function index(Request $request)
    {
        $q = Arbol::with([
            'conglomerado:id,codigo,municipio',
            'subparcela:id,codigo,conglomerado_id'
        ])->latest();

        if ($search = $request->get('search')) {
            $q->where(function($w) use ($search){
                $w->where('nombre_cientifico','like',"%{$search}%")
                  ->orWhere('nombres_comunes','like',"%{$search}%");
            });
        }

        return $q->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'conglomerado_id'   => ['required','exists:conglomerados,id'],
            'subparcela_id'     => ['required','exists:subparcelas,id'],
            'nombre_cientifico' => ['required','string','max:255','regex:/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/'],
            'nombres_comunes'   => ['nullable','string','max:255'],
            'categoria'         => ['required', Rule::in(['Latifoliado','Conífera','Palma','Otro'])],
            'dap'               => ['required','numeric','min:0','max:500'],
            'altura'            => ['required','numeric','min:0','max:100'],
            'latitud'           => ['nullable','numeric','between:-90,90'],
            'longitud'          => ['nullable','numeric','between:-180,180'],
            'azimut'            => ['nullable','integer','min:0','max:360'],
            'usos'              => ['nullable','string','max:200'],
            'observaciones'     => ['nullable','string'],
            'estado'            => ['nullable', Rule::in(['pendiente_validacion','validado'])],
            'validado_por'      => ['nullable','string','max:255'],
            'fecha'             => ['required','date','before_or_equal:today'],
            'evidencias'        => ['nullable','array'],
            'evidencias.*'      => ['string','max:255'],
        ]);

        // regla: la subparcela debe pertenecer al conglomerado
        $sp = Subparcela::find($data['subparcela_id']);
        if (!$sp || $sp->conglomerado_id != $data['conglomerado_id']) {
            return response()->json(['message'=>'La subparcela no pertenece al conglomerado indicado.'], 422);
        }

        $arbol = Arbol::create($data);
        return response()->json($arbol->load('conglomerado:id,codigo','subparcela:id,codigo'), 201);
    }

    public function show(Arbol $arbol)
    {
        return $arbol->load('conglomerado:id,codigo,municipio','subparcela:id,codigo');
    }

    public function update(Request $request, Arbol $arbol)
    {
        $data = $request->validate([
            'conglomerado_id'   => ['sometimes','exists:conglomerados,id'],
            'subparcela_id'     => ['sometimes','exists:subparcelas,id'],
            'nombre_cientifico' => ['sometimes','string','max:255','regex:/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/'],
            'nombres_comunes'   => ['nullable','string','max:255'],
            'categoria'         => ['sometimes', Rule::in(['Latifoliado','Conífera','Palma','Otro'])],
            'dap'               => ['sometimes','numeric','min:0','max:500'],
            'altura'            => ['sometimes','numeric','min:0','max:100'],
            'latitud'           => ['nullable','numeric','between:-90,90'],
            'longitud'          => ['nullable','numeric','between:-180,180'],
            'azimut'            => ['nullable','integer','min:0','max:360'],
            'usos'              => ['nullable','string','max:200'],
            'observaciones'     => ['nullable','string'],
            'estado'            => ['sometimes', Rule::in(['pendiente_validacion','validado'])],
            'validado_por'      => ['nullable','string','max:255'],
            'fecha'             => ['sometimes','date','before_or_equal:today'],
            'evidencias'        => ['nullable','array'],
            'evidencias.*'      => ['string','max:255'],
        ]);

        // Si cambian cong/subparcela, validar pertenencia
        $congId = $data['conglomerado_id'] ?? $arbol->conglomerado_id;
        $subId  = $data['subparcela_id'] ?? $arbol->subparcela_id;
        $sp = Subparcela::find($subId);
        if (!$sp || $sp->conglomerado_id != $congId) {
            return response()->json(['message'=>'La subparcela no pertenece al conglomerado indicado.'], 422);
        }

        $arbol->update($data);
        return $arbol->load('conglomerado:id,codigo','subparcela:id,codigo');
    }

    public function destroy(Arbol $arbol)
    {
        $arbol->delete();
        return response()->noContent();
    }
}
