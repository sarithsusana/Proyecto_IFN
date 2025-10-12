<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubparcelaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'conglomerado_id' => 'required|exists:conglomerados,id',
            'codigo'          => 'required|string|max:50|unique:subparcelas,codigo,NULL,id,conglomerado_id,'.$this->input('conglomerado_id'),
            'estado'          => 'required|in:activo,inactivo,pendiente',
            'coberturas'      => 'required|string|max:255',
            'latitud'         => 'required|numeric|between:-90,90',
            'longitud'        => 'required|numeric|between:-180,180',
        ];
    }
}
