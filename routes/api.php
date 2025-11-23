<?php

use App\Http\Controllers\Api\MeterLogController;
use App\Http\Controllers\Api\RenterRequestApiController;
use App\Http\Controllers\Api\RoomApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// House and Room API routes
Route::get('/houses', [RoomApiController::class, 'houses']);
Route::get('/houses/{id}/rooms', [RoomApiController::class, 'roomsByHouse']);
Route::get('/rooms/{id}', [RoomApiController::class, 'roomDetail']);

// Renter Request API routes
Route::post('/renter-request', [RenterRequestApiController::class, 'store']);
Route::get('/renter-requests/pending-count', [RenterRequestApiController::class, 'getPendingCount'])->middleware('auth:sanctum');