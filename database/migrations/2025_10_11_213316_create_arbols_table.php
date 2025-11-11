<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('arboles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conglomerado_id')->constrained('conglomerados')->cascadeOnDelete();
            $table->foreignId('subparcela_id')->constrained('subparcelas')->cascadeOnDelete();
            $table->string('nombre_cientifico');   // “Género especie” (frontend lo muestra en cursiva)
            $table->string('nombres_comunes')->nullable();
            $table->string('categoria');           // Latifoliado / Conífera / Palma / Otro
            $table->decimal('dap', 6, 1);          // cm
            $table->decimal('altura', 5, 1);       // m
            $table->decimal('latitud', 10, 6)->nullable();
            $table->decimal('longitud', 10, 6)->nullable();
            $table->unsignedSmallInteger('azimut')->nullable(); // 0-360
            $table->string('usos', 200)->nullable();
            $table->text('observaciones')->nullable();
            $table->json('evidencias')->nullable();
            $table->enum('estado', ['pendiente_validacion','validado'])->default('pendiente_validacion');
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('validado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('arboles');
    }
};
