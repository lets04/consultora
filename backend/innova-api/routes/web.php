<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['service' => 'innova-api', 'docs' => '/api/health']);
});
