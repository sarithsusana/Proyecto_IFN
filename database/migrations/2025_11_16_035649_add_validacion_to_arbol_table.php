<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 public function up()
{
    Schema::table('arbol', function (Blueprint $table) {

        if (!Schema::hasColumn('arbol', 'validado_por')) {
            $table->unsignedBigInteger('validado_por')->nullable()->after('observaciones');
        }

        if (!Schema::hasColumn('arbol', 'fecha_validacion')) {
            $table->timestamp('fecha_validacion')->nullable()->after('validado_por');
        }
    });
}


public function down()
{
    Schema::table('arbol', function (Blueprint $table) {
        if (Schema::hasColumn('arbol', 'validado_por')) {
            $table->dropColumn('validado_por');
        }

        if (Schema::hasColumn('arbol', 'fecha_validacion')) {
            $table->dropColumn('fecha_validacion');
        }

    });
}


};
