<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'persona';

    // Si quieres que la PK lógica sea el correo:
    protected $primaryKey = 'correo';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'correo',
        'nombre_completo',
        'documento',
        'contraseña',
        'tipo_usuario',
        'fecha_creacion',
    ];

    protected $hidden = [
        'contraseña',
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
    ];
}
