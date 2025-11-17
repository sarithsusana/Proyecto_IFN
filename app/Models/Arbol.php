<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arbol extends Model
{
    // Nombre real de la tabla
    protected $table = 'arbol';

    // Llave primaria real
    protected $primaryKey = 'id_arbol';

    // Si la clave no es incrementing tipo string, aquí se cambia;
    // en tu caso es autoincremental, así que está bien.
    public $incrementing = true;

    // Tipo de clave primaria
    protected $keyType = 'int';

    // La tabla tiene created_at / updated_at
    public $timestamps = true;

    protected $fillable = [
        'id_conglomerado',
        'id_subparcela',
        'nombre_cientifico',
        'nombres_comunes',
        'categoria',
        'dap',
        'altura',
        'latitud',
        'longitud',
        'azimut',
        'usos',
        'observaciones',
        'evidencias',
        'estado',
        'registrado_por',
        'validado_por',
        'fecha_validacion',
    ];

    protected $casts = [
        'evidencias' => 'array',
        'latitud'    => 'decimal:6',
        'longitud'   => 'decimal:6',
        'fecha_validacion' => 'datetime',
    ];

    // Relaciones (ajusta nombres de modelos si difieren)
    public function conglomerado()
    {
        return $this->belongsTo(Conglomerado::class, 'id_conglomerado');
    }

    public function subparcela()
    {
        return $this->belongsTo(Subparcela::class, 'id_subparcela');
    }

    public function registrador()
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    public function validador()
    {
        return $this->belongsTo(User::class, 'validado_por');
    }
}
