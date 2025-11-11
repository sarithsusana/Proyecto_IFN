<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subparcela extends Model
{
    protected $fillable = [
        'codigo','estado','coberturas','latitud','longitud','conglomerado_id'
    ];

    protected $casts = [
        'latitud' => 'decimal:6',
        'longitud' => 'decimal:6',
    ];

    public function conglomerado() { return $this->belongsTo(Conglomerado::class); }
}
