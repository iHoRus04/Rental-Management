<?php

use App\Http\Controllers\Api\MeterLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/meter-logs/{roomId}/{month}/{year}', [MeterLogController::class, 'show']);
