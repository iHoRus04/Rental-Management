<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(House $house)
    {
        $rooms = $house->rooms()->get();

        return Inertia::render('Landlord/Rooms/Index', [
            'house' => $house,
            'rooms' => $rooms,
        ]);
    }

    public function create(House $house)
    {
        return Inertia::render('Landlord/Rooms/Create', [
            'house' => $house,
        ]);
    }

    public function store(Request $request, House $house)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'nullable|integer',
            'area' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $house->rooms()->create($validated);

        return redirect()->route('landlord.houses.rooms.index', $house->id)
                         ->with('success', 'Thêm phòng thành công!');
    }

    public function show(House $house, Room $room)
    {
        return Inertia::render('Landlord/Rooms/Show', [
            'house' => $house,
            'room' => $room,
        ]);
    }

    public function edit(House $house, Room $room)
    {
        return Inertia::render('Landlord/Rooms/Edit', [
            'house' => $house,
            'room' => $room,
        ]);
    }

    public function update(Request $request, House $house, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'nullable|integer',
            'area' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $room->update($validated);

        return redirect()->route('landlord.houses.rooms.index', [$house->id, $room->id])
                        ->with('success', 'Cập nhật phòng thành công!');
    }

    public function destroy(House $house, Room $room)
    {
        $room->delete();

        return redirect()->back()->with('success', 'Đã xóa phòng');
    }
}
