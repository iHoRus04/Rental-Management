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
     * Hiển thị danh sách các dịch vụ tiện ích hiện có và dịch vụ gán theo phòng
     */
    public function index(Request $request)
    {
        $user     = auth()->user();
        $landlordId = $user->getLandlordId(); // Lấy ID chủ trọ (kể cả khi đang login là nhân viên)
        $houseIds = $user->getAccessibleHouseIds();

        $houses = \App\Models\House::whereIn('id', $houseIds)->withCount('rooms')->get();

        // Chỉ lấy dịch vụ của chính Chủ trọ này
        $services = Service::where('user_id', $landlordId)
            ->where('is_active', true)
            ->get();

        $rooms = Room::whereIn('house_id', $houseIds)
            ->with(['services' => function ($q) {
                $q->where('room_services.is_active', true);
            }])
            ->get();

        return Inertia::render('Landlord/Services/Index', [
            'services' => $services,
            'houses'   => $houses,
            'rooms'    => $rooms,
        ]);
    }

    /**
     * Hiển thị giao diện Form tạo dịch vụ mới
     */
    public function create()
    {
        return Inertia::render('Landlord/Services/Create');
    }

    /**
     * Lưu dịch vụ tiện ích mới vào CSDL
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
            'unit'          => 'required|in:kwh,m3,month,service',
            'is_active'     => 'boolean',
        ]);

        // Tự động gán user_id = Chủ trọ đang đăng nhập
        $landlordId = auth()->user()->getLandlordId();
        $service = Service::create(array_merge($validated, ['user_id' => $landlordId]));

        return redirect()->route('landlord.services.index')
            ->with('success', 'Dịch vụ đã được tạo thành công!');
    }

    /**
     * Hiển thị trang chỉnh sửa thông tin dịch vụ
     */
    public function edit(Service $service)
    {
        return Inertia::render('Landlord/Services/Edit', [
            'service' => $service,
        ]);
    }

    /**
     * Cập nhật thông tin dịch vụ (tự động đồng bộ đơn giá mới cho tất cả các phòng đang gán dịch vụ này)
     */
    public function update(Request $request, Service $service)
    {
        // Kiểm tra quyền sở hữu: chỉ Chủ trọ tạo dịch vụ mới được sửa
        $landlordId = auth()->user()->getLandlordId();
        if ($service->user_id !== $landlordId) {
            abort(403, 'Bạn không có quyền chỉnh sửa dịch vụ này.');
        }

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
            'unit'          => 'required|in:kwh,m3,month,service',
            'is_active'     => 'boolean',
            'sync_to_rooms' => 'nullable|boolean',
        ]);

        $service->update($validated);

        // ✅ Đồng bộ đơn giá chỉ cho phòng thuộc nhà trọ của CHÍNH CHỦ TRỌ NÀY
        $houseIds = auth()->user()->getAccessibleHouseIds();
        $roomIds  = Room::whereIn('house_id', $houseIds)->pluck('id');
        $updatedRoomsCount = RoomService::where('service_id', $service->id)
            ->whereIn('room_id', $roomIds)
            ->update(['price' => $validated['default_price']]);

        $message = 'Dịch vụ đã được cập nhật thành công!';
        if ($updatedRoomsCount > 0) {
            $message .= " Đã đồng bộ đơn giá mới ({$validated['default_price']} ₫) cho {$updatedRoomsCount} phòng của bạn.";
        }

        return redirect()->route('landlord.services.index')
            ->with('success', $message);
    }

    /**
     * Xóa dịch vụ tiện ích (có kiểm tra an toàn)
     */
    public function destroy(Service $service)
    {
        // Kiểm tra quyền sở hữu: chỉ Chủ trọ tạo dịch vụ mới được xóa
        $landlordId = auth()->user()->getLandlordId();
        if ($service->user_id !== $landlordId) {
            abort(403, 'Bạn không có quyền xóa dịch vụ này.');
        }

        // Chỉ kiểm tra phòng thuộc nhà trọ của chính Chủ trọ này
        $houseIds           = auth()->user()->getAccessibleHouseIds();
        $roomIds            = Room::whereIn('house_id', $houseIds)->pluck('id');
        $assignedRoomsCount = RoomService::where('service_id', $service->id)
            ->whereIn('room_id', $roomIds)
            ->count();

        if ($assignedRoomsCount > 0) {
            return redirect()->back()->with('error',
                "Không thể xóa! Dịch vụ \"{$service->name}\" đang được gán cho {$assignedRoomsCount} phòng của bạn. Vui lòng gỡ dịch vụ khỏi các phòng trước."
            );
        }

        $service->delete();

        return redirect()->route('landlord.services.index')
            ->with('success', 'Đã xóa dịch vụ thành công!');
    }


    /**
     * Xem danh sách các dịch vụ được gán cho một phòng cụ thể
     */
    public function roomServices(Room $room)
    {
        $room->load(['services', 'house']);

        // Chỉ hiển thị dịch vụ do chính Chủ trọ này tạo ra
        $landlordId  = auth()->user()->getLandlordId();
        $allServices = Service::where('user_id', $landlordId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Landlord/Services/RoomServices', [
            'room'         => $room,
            'roomServices' => $room->services,
            'allServices'  => $allServices,
        ]);
    }

    /**
     * Gán dịch vụ tiện ích cho phòng trọ kèm giá tùy chỉnh
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
     * Cập nhật thông tin dịch vụ được gán trong phòng (đơn giá, bật/tắt, ghi chú)
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
     * Gỡ dịch vụ ra khỏi phòng trọ
     */
    public function detachFromRoom(RoomService $roomService)
    {
        $roomService->delete();

        return back()->with('success', 'Dịch vụ đã được gỡ khỏi phòng!');
    }
}
