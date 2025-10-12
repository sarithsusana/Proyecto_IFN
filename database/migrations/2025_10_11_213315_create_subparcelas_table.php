<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subparcelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conglomerado_id')
                  ->constrained('conglomerados')
                  ->cascadeOnDelete();

            $table->string('codigo'); // código interno de la subparcela
            $table->enum('estado', ['activo','inactivo','pendiente'])->default('activo');
            $table->string('coberturas')->nullable();

            // Coordenadas
            $table->decimal('latitud', 10, 6)->nullable();
            $table->decimal('longitud', 10, 6)->nullable();

            // Evita duplicados por (conglomerado, codigo)
            $table->unique(['conglomerado_id','codigo']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subparcelas');
    }
};
