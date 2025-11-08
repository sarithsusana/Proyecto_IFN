<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    $path = public_path('app/index.html');
    if (!File::exists($path)) {
        abort(404, 'Frontend no encontrado');
    }
    return response()->file($path);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
