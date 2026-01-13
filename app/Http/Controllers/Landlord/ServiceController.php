<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Room;
use App\Models\RoomService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/**
 * ServiceController
 *
 * Quản lý dịch vụ: CRUD cho services và gán dịch vụ cho phòng
 */
class ServiceController extends Controller
{
    /**
     * Display a listing of services
     */
    public function index()
    {
        $services = Service::where('is_active', true)->get();

        return Inertia::render('Landlord/Services/Index', [
            'services' => $services,
        ]);
    }

    /**
     * Show the form for creating a new service
     */
    public function create()
    {
        return Inertia::render('Landlord/Services/Create');
    }

    /**
     * Store a newly created service
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
            'unit' => 'required|in:kwh,m3,month,service',
            'is_active' => 'boolean',
        ]);

        $service = Service::create($validated);

        return redirect()->route('landlord.services.index')
            ->with('success', 'Dịch vụ đã được tạo thành công!');
    }

    /**
     * Show the form for editing a service
     */
    public function edit(Service $service)
    {
        return Inertia::render('Landlord/Services/Edit', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified service
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
            'unit' => 'required|in:kwh,m3,month,service',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return redirect()->route('landlord.services.index')
            ->with('success', 'Dịch vụ đã được cập nhật thành công!');
    }

    /**
     * Remove the specified service
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('landlord.services.index')
            ->with('success', 'Dịch vụ đã được xóa thành công!');
    }

    /**
     * Show services for a specific room
     */
    public function roomServices(Room $room)
    {
        $room->load(['services', 'house']);
        $allServices = Service::where('is_active', true)->get();

        return Inertia::render('Landlord/Services/RoomServices', [
            'room' => $room,
            'roomServices' => $room->services,
            'allServices' => $allServices,
        ]);
    }

    /**
     * Attach service to room
     */
    public function attachToRoom(Request $request, Room $room)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        // Check if already exists
        $exists = RoomService::where('room_id', $room->id)
            ->where('service_id', $validated['service_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['service_id' => 'Dịch vụ này đã được thêm vào phòng!']);
        }

        RoomService::create([
            'room_id' => $room->id,
            'service_id' => $validated['service_id'],
            'price' => $validated['price'],
            'note' => $validated['note'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Dịch vụ đã được thêm vào phòng!');
    }

    /**
     * Update room service
     */
    public function updateRoomService(Request $request, RoomService $roomService)
    {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'note' => 'nullable|string',
        ]);

        $roomService->update($validated);

        return back()->with('success', 'Dịch vụ phòng đã được cập nhật!');
    }

    /**
     * Detach service from room
     */
    public function detachFromRoom(RoomService $roomService)
    {
        $roomService->delete();

        return back()->with('success', 'Dịch vụ đã được gỡ khỏi phòng!');
    }
}
