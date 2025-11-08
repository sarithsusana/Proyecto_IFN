<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conglomerado extends Model
{
    protected $fillable = [
        'codigo','region','municipio','vereda','fecha','brigada',
        'latitud','longitud','observaciones','adjuntos'
    ];

    protected $casts = [
        'fecha' => 'date',
        'adjuntos' => 'array',
        'latitud' => 'decimal:6',
        'longitud' => 'decimal:6',
    ];

    public function subparcelas() {
        return $this->hasMany(Subparcela::class);
    }

    public function arboles() {
        return $this->hasMany(Arbol::class);
    }
}
