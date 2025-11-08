<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('conglomerados', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('region');
            $table->string('municipio');
            $table->string('vereda');
            $table->date('fecha');
            $table->string('brigada');
            $table->decimal('latitud', 10, 6);
            $table->decimal('longitud', 10, 6);
            $table->text('observaciones')->nullable();
            $table->json('adjuntos')->nullable(); // nombres de archivos
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('conglomerados');
    }
};
