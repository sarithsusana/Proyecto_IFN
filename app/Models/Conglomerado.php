<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conglomerado extends Model
{
    protected $table = 'conglomerado';                 
    protected $primaryKey = 'id_conglomerado';        
    public $timestamps = false;                       

    protected $fillable = [
        'correo',
        'nombre_brigada',
        'codigo_conglomerado',
        'latitud',
        'longitud',
        'altitud',
        'fecha_inicio',
        'fecha_final',
        'region',
        'estado',
    ];
}
