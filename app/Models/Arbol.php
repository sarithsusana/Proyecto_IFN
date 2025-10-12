<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arbol extends Model
{
    protected $fillable = [
        'conglomerado_id','subparcela_id',
        'nombre_cientifico','nombres_comunes','categoria',
        'dap','altura','latitud','longitud','azimut',
        'usos','observaciones','estado','validado_por','fecha','evidencias'
    ];

    protected $casts = [
        'fecha' => 'date',
        'evidencias' => 'array',
        'dap' => 'decimal:2',
        'altura' => 'decimal:2',
        'latitud' => 'decimal:6',
        'longitud' => 'decimal:6',
    ];

    public function conglomerado() {
        return $this->belongsTo(Conglomerado::class);
    }

    public function subparcela() {
        return $this->belongsTo(Subparcela::class);
    }
}
