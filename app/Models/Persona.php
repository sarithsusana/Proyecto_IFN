<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Persona extends Authenticatable
{
    use HasApiTokens, HasRoles;

    protected $table = 'persona';
    protected $primaryKey = 'documento';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['documento','nombre_completo','correo','contrasena','tipo_persona','id_administrador'];
    protected $hidden   = ['contrasena'];

    public function getAuthPassword()
    {
        return $this->contrasena; // usa la columna 'contrasena'
    }
}
