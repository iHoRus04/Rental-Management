<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RenterRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicRoomController extends Controller
{
    /**
     * Get list of available rooms
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Get rooms without active contracts (vacant rooms)
            $rooms = Room::with(['house'])
                ->whereDoesntHave('contracts', function ($query) {
                    $query->where('status', 'active');
                })
                ->where('status', 'available')
                ->get()
                ->map(function ($room) {
                    return [
                        'id' => $room->id,
                        'name' => $room->name,
                        'price' => $room->price,
                        'floor' => $room->floor,
                        'area' => $room->area,
                        'description' => $room->description,
                        'status' => $room->status,
                        'house' => [
                            'id' => $room->house->id,
                            'name' => $room->house->name,
                            'address' => $room->house->address,
                        ],
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Available rooms retrieved successfully',
                'data' => $rooms,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get room details by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $room = Room::with(['house'])->find($id);

            if (!$room) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room not found',
                ], 404);
            }

            // Check if room has active contract
            $hasActiveContract = $room->contracts()
                ->where('status', 'active')
                ->exists();

            $roomData = [
                'id' => $room->id,
                'name' => $room->name,
                'price' => $room->price,
                'floor' => $room->floor,
                'area' => $room->area,
                'description' => $room->description,
                'status' => $room->status,
                'is_available' => !$hasActiveContract && $room->status === 'available',
                'house' => [
                    'id' => $room->house->id,
                    'name' => $room->house->name,
                    'address' => $room->house->address,
                ],
            ];

            return response()->json([
                'success' => true,
                'message' => 'Room details retrieved successfully',
                'data' => $roomData,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve room details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit a rental request
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function requestRent(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'room_id' => 'required|exists:rooms,id',
                'full_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'message' => 'nullable|string',
                'move_in_date' => 'nullable|date|after_or_equal:today',
            ]);

            // Check if room exists and is available
            $room = Room::find($validated['room_id']);
            
            if (!$room) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room not found',
                ], 404);
            }

            // Check if room has active contract
            $hasActiveContract = $room->contracts()
                ->where('status', 'active')
                ->exists();

            if ($hasActiveContract) {
                return response()->json([
                    'success' => false,
                    'message' => 'This room is no longer available',
                ], 422);
            }

            // Create rental request
            $renterRequest = RenterRequest::create([
                'room_id' => $validated['room_id'],
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'message' => $validated['message'] ?? null,
                'move_in_date' => $validated['move_in_date'] ?? null,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rental request submitted successfully. The landlord will contact you soon.',
                'data' => [
                    'request_id' => $renterRequest->id,
                    'room_name' => $room->name,
                    'status' => $renterRequest->status,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit rental request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
