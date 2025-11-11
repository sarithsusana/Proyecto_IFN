<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arbol extends Model
{
    protected $fillable = [
        'conglomerado_id','subparcela_id','nombre_cientifico','nombres_comunes',
        'categoria','dap','altura','latitud','longitud','azimut','usos',
        'observaciones','evidencias','estado','registrado_por','validado_por'
    ];

    protected $casts = [
        'evidencias' => 'array',
        'latitud' => 'decimal:6',
        'longitud' => 'decimal:6',
    ];

    public function conglomerado(){ return $this->belongsTo(Conglomerado::class); }
    public function subparcela(){ return $this->belongsTo(Subparcela::class); }
    public function registrador(){ return $this->belongsTo(User::class,'registrado_por'); }
    public function validador(){ return $this->belongsTo(User::class,'validado_por'); }
}
