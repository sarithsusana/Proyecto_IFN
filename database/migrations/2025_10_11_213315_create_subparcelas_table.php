<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('subparcelas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->enum('estado', ['activo','inactivo','pendiente'])->default('pendiente');
            $table->string('coberturas');
            $table->decimal('latitud', 10, 6);
            $table->decimal('longitud', 10, 6);
            $table->foreignId('conglomerado_id')->constrained('conglomerados')->cascadeOnDelete();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('subparcelas');
    }
};
