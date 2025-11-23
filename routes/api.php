<?php

use App\Http\Controllers\Api\MeterLogController;
use App\Http\Controllers\Api\PublicRoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/meter-logs/{roomId}/{month}/{year}', [MeterLogController::class, 'show']);

// Public API endpoints for renters
Route::prefix('public')->group(function () {
    // Get list of available rooms
    Route::get('/rooms', [PublicRoomController::class, 'index']);
    
    // Get room details by ID
    Route::get('/rooms/{id}', [PublicRoomController::class, 'show']);
    
    // Submit rental request
    Route::post('/request-rent', [PublicRoomController::class, 'requestRent']);
});
