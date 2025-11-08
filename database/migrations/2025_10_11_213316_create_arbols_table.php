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

            $table->string('nombre_cientifico');
            $table->string('nombres_comunes')->nullable();
            $table->enum('categoria', ['Latifoliado','Conífera','Palma','Otro'])->default('Latifoliado');
            $table->decimal('dap', 6, 2);        // cm
            $table->decimal('altura', 5, 2);     // m
            $table->decimal('latitud', 10, 6)->nullable();
            $table->decimal('longitud', 10, 6)->nullable();
            $table->unsignedSmallInteger('azimut')->nullable();
            $table->string('usos', 200)->nullable();
            $table->text('observaciones')->nullable();

            $table->enum('estado', ['pendiente_validacion','validado'])->default('pendiente_validacion');
            $table->string('validado_por')->nullable();
            $table->date('fecha'); // fecha de registro/campo

            $table->json('evidencias')->nullable(); // nombres de archivos
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('arboles');
    }
};
