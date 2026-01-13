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
Route::get('/rooms', [RoomApiController::class, 'allRooms']);

// Renter Request API routes
Route::post('/renter-request', [RenterRequestApiController::class, 'store']);
Route::get('/renter-requests/pending-count', [RenterRequestApiController::class, 'getPendingCount'])->middleware('auth:sanctum');

// Meter Log API routes
Route::get('/meter-logs/{roomId}/{month}/{year}', [MeterLogController::class, 'show']);

// Room Services API route
Route::get('/rooms/{roomId}/services', function ($roomId) {
    $room = \App\Models\Room::with('services')->find($roomId);
    if (!$room) {
        return response()->json(['services' => []], 404);
    }
    return response()->json(['services' => $room->services]);
});

// SSO validate route - external app calls this to validate token and retrieve user info
Route::get('/sso-validate/{token}', [\App\Http\Controllers\SsoController::class, 'validateToken']);
// Simple endpoint to let frontends check whether the current session is authenticated.
// Use the `web` middleware so session-based auth (cookies) is available here.
Route::middleware(['web'])->get('/authenticated', function (Request $request) {
    $user = $request->user() ?? auth('web')->user();

    return response()->json([
        'authenticated' => $user ? true : false,
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name ?? null,
            'email' => $user->email ?? null,
        ] : null,
    ]);
});