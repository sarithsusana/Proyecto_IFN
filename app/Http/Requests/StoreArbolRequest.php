<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArbolRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'conglomerado_id'   => 'required|exists:conglomerados,id',
            'subparcela_id'     => 'required|exists:subparcelas,id',
            'nombre_cientifico' => ['required','string','max:255','regex:/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/'],
            'nombres_comunes'   => 'nullable|string|max:255',
            'categoria'         => 'required|in:Latifoliado,Conífera,Palma,Otro',
            'dap'               => 'required|numeric|min:0|max:500',
            'altura'            => 'required|numeric|min:0|max:100',
            'latitud'           => 'nullable|numeric|between:-90,90',
            'longitud'          => 'nullable|numeric|between:-180,180',
            'azimut'            => 'nullable|integer|min:0|max:360',
            'usos'              => 'nullable|string|max:200',
            'observaciones'     => 'nullable|string',
            'estado'            => 'nullable|in:pendiente_validacion,validado',
            'validado_por'      => 'nullable|string|max:255',
            'fecha'             => 'required|date|before_or_equal:today',
            'evidencias'        => 'nullable|array',
        ];
    }
}
