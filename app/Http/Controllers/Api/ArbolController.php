<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arbol;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArbolController extends Controller
{
    public function index(Request $request) {
        $q = Arbol::with(['conglomerado:id,codigo','subparcela:id,codigo','validador:id,name']);

        if ($cg = $request->get('conglomerado')) $q->whereHas('conglomerado', fn($qq)=>$qq->where('codigo','like',"%$cg%"));
        if ($sp = $request->get('subparcela'))  $q->whereHas('subparcela',  fn($qq)=>$qq->where('codigo','like',"%$sp%"));
        if ($es = $request->get('especie'))     $q->where('nombre_cientifico','like',"%$es%");
        if ($st = $request->get('estado'))      $q->where('estado',$st);

        if ($desde = $request->get('fecha_desde')) $q->whereDate('created_at','>=',$desde);
        if ($hasta = $request->get('fecha_hasta')) $q->whereDate('created_at','<=',$hasta);

        return $q->orderBy('created_at','desc')->paginate(50);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'conglomerado_id'   => 'required|exists:conglomerados,id',
            'subparcela_id'     => 'required|exists:subparcelas,id',
            'nombre_cientifico' => ['required','string','regex:/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/'],
            'nombres_comunes'   => 'nullable|string',
            'categoria'         => ['required', Rule::in(['Latifoliado','Conífera','Palma','Otro'])],
            'dap'               => 'required|numeric|min:0|max:500',
            'altura'            => 'required|numeric|min:0|max:100',
            'latitud'           => 'nullable|numeric|between:-90,90',
            'longitud'          => 'nullable|numeric|between:-180,180',
            'azimut'            => 'nullable|integer|min:0|max:360',
            'usos'              => 'nullable|string|max:200',
            'observaciones'     => 'nullable|string|max:500',
            'evidencias'        => 'nullable|array',
        ]);

        $data['registrado_por'] = $request->user()->id;
        // Si es Botánico se valida de una:
        if ($request->user()->role === 'Botanico') {
            $data['estado'] = 'validado';
            $data['validado_por'] = $request->user()->id;
        }

        return Arbol::create($data);
    }

    public function update(Request $request, Arbol $arbol) {
        $data = $request->validate([
            'nombre_cientifico' => ['sometimes','required','string','regex:/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/'],
            'nombres_comunes'   => 'nullable|string',
            'categoria'         => ['sometimes','required', Rule::in(['Latifoliado','Conífera','Palma','Otro'])],
            'dap'               => 'sometimes|required|numeric|min:0|max:500',
            'altura'            => 'sometimes|required|numeric|min:0|max:100',
            'latitud'           => 'nullable|numeric|between:-90,90',
            'longitud'          => 'nullable|numeric|between:-180,180',
            'azimut'            => 'nullable|integer|min:0|max:360',
            'usos'              => 'nullable|string|max:200',
            'observaciones'     => 'nullable|string|max:500',
            'evidencias'        => 'nullable|array',
        ]);
        $arbol->update($data);
        return $arbol->fresh();
    }

    public function destroy(Arbol $arbol) {
        $arbol->delete();
        return response()->json(['ok'=>true]);
    }

    public function validar(Request $request, Arbol $arbol) {
        $request->user()->can('validate', $arbol); // opcional si luego agregas policies
        $arbol->update([
            'estado' => 'validado',
            'validado_por' => $request->user()->id,
        ]);
        return $arbol->fresh();
    }

    // Estadísticas simples para Reportes → “Mostrar estadísticas”
    public function stats() {
        return [
            'total'      => Arbol::count(),
            'validado'   => Arbol::where('estado','validado')->count(),
            'pendiente'  => Arbol::where('estado','pendiente_validacion')->count(),
            'porCategoria' => Arbol::selectRaw('categoria, COUNT(*) as c')->groupBy('categoria')->get(),
        ];
    }
}
