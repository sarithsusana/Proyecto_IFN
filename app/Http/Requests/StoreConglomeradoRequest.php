<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConglomeradoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'codigo'       => 'required|string|max:50|unique:conglomerados,codigo',
            'region'       => 'required|string|max:100',
            'municipio'    => 'required|string|max:120',
            'vereda'       => 'required|string|max:120',
            'fecha'        => 'required|date|before_or_equal:today',
            'brigada'      => 'required|string|max:100',
            'latitud'      => 'required|numeric|between:-90,90',
            'longitud'     => 'required|numeric|between:-180,180',
            'observaciones'=> 'nullable|string|max:500',
        ];
    }
}
