<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subparcela extends Model
{
    // Nombre de la tabla y PK reales
    protected $table = 'subparcela';
    protected $primaryKey = 'id_subparcela';
    public $timestamps = false; // la tabla no tiene created_at/updated_at

    protected $fillable = [
        'codigo_conglomerado',
        'nombre_brigada',
        'fecha_levantamiento',
        'numero_subparcela',
        'codigo_subparcela',
        'cobertura',
        'alteraciones',
        'observaciones',
    ];

    protected $casts = [
        'fecha_levantamiento' => 'datetime',
    ];

    // Relación con conglomerado usando el código como FK
    public function conglomerado()
    {
        return $this->belongsTo(Conglomerado::class, 'codigo_conglomerado', 'codigo_conglomerado');
    }
}
