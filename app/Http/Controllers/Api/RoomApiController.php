<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\House;

class RoomApiController extends Controller
{
    // Danh sách nhà
    public function houses()
    {
        return response()->json([
            'success' => true,
            'data' => House::all()
        ]);
    }

    // Danh sách phòng theo nhà
    public function roomsByHouse($houseId)
    {
        $house = House::findOrFail($houseId);

        return response()->json([
            'success' => true,
            'data' => $house->rooms()
                            ->where('status', 'available')
                            ->select('id', 'name', 'price', 'area', 'floor', 'status')
                            ->get()
        ]);
    }

    // Chi tiết 1 phòng
    public function roomDetail($roomId)
    {
        $room = Room::with('house')
                    ->where('status', 'available')
                    ->findOrFail($roomId);

        return response()->json([
            'success' => true,
            'data' => $room
        ]);
    }

    // Danh sách tất cả phòng
    public function allRooms()
    {
        $rooms = Room::with('house')
                    ->select('id', 'name', 'price', 'area', 'floor', 'status', 'images', 'house_id')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }
}