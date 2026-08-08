<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\House;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * HouseController
 *
 * Quản lý nhà trọ (Houses) của landlord.
 * - Sử dụng trait AuthorizesRequests để tận dụng authorization blade/helpers.
 * - Kiểm tra ownership (so sánh user_id) trước khi hiển thị/chỉnh sửa/xóa.
 * - Xử lý upload/xóa hình ảnh thông qua Storage disk 'public'.
 */
class HouseController extends Controller
{
    use AuthorizesRequests;

    /**
     * Hiển thị danh sách các nhà trọ thuộc quyền quản lý của chủ trọ/nhân viên
     */
    public function index(Request $request)
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();
        $houses   = House::whereIn('id', $houseIds)->latest()->get();
        
        if ($request->wantsJson()) {
            return response()->json([
                'houses' => $houses,
            ]);
        }
        
        return Inertia::render('Landlord/Houses/Index', [
            'houses' => $houses,
        ]);
    }

    /**
     * Xem thông tin chi tiết của một nhà trọ
     */
    public function show(House $house)
    {
        if (!Auth::user()->managesHouse($house)) {
            abort(403, 'Bạn không có quyền truy cập nhà trọ này.');
        }

        return Inertia::render('Landlord/Houses/Show', [
            'house' => $house,
        ]);
    }

    /**
     * Hiển thị giao diện Form tạo mới nhà trọ
     */
    public function create()
    {
        $user = Auth::user();
        if ($user->role === 'staff' && !$user->hasPermission('houses.create')) {
            abort(403, 'Bạn không có quyền tạo nhà trọ.');
        }
        return Inertia::render('Landlord/Houses/Create');
    }

    /**
     * Lưu thông tin nhà trọ mới vào CSDL (xử lý lưu hình ảnh đại diện)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'staff' && !$user->hasPermission('houses.create')) {
            abort(403, 'Bạn không có quyền tạo nhà trọ.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('houses', 'public');
        }

        if ($user->role === 'staff') {
            $house = new House($validated);
            $house->user_id = $user->landlord_id;
            $house->save();
            
            // Tự động gán staff vào quản lý nhà trọ vừa tạo
            $user->staffedHouses()->attach($house->id, ['assigned_at' => now()]);
        } else {
            $user->houses()->create($validated);
        }

        return redirect()->route('landlord.houses.index')
            ->with('success', 'Tạo nhà trọ thành công!');
    }

    /**
     * Hiển thị trang giao diện chỉnh sửa thông tin nhà trọ
     */
    public function edit(House $house)
    {
        // ✅ Debug log
        Log::info('Edit House - Start', [
            'house_id' => $house->id,
            'house_user_id' => $house->user_id,
            'current_user_id' => Auth::id(),
            'house_data' => $house->toArray(),
        ]);

        $user = Auth::user();
        
        // ✅ Kiểm tra quyền (landlord sở hữu, staff được gán và có quyền edit)
        if (!$user->managesHouse($house) || ($user->role === 'staff' && !$user->hasPermission('houses.edit'))) {
            Log::warning('Edit House - Access Denied', [
                'house_user_id' => $house->user_id,
                'current_user_id' => Auth::id(),
            ]);
            abort(403, 'Bạn không có quyền chỉnh sửa nhà trọ này.');
        }

        Log::info('Edit House - Rendering', [
            'house' => $house->toArray(),
        ]);

        return Inertia::render('Landlord/Houses/Edit', [
            'house' => $house,
        ]);
    }

    /**
     * Cập nhật thông tin chi tiết nhà trọ (tên, địa chỉ, loại hình, ảnh)
     */
    public function update(Request $request, House $house)
{
    $user = Auth::user();
    if (!$user->managesHouse($house) || ($user->role === 'staff' && !$user->hasPermission('houses.edit'))) {
        abort(403, 'Bạn không có quyền cập nhật nhà trọ này.');
    }

    Log::info('Update request data:', $request->all());
    
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'type' => 'required|string|max:255',
        'address' => 'required|string|max:255',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);
    
    // ✅ Chỉ xử lý image nếu có file mới được upload
    if ($request->hasFile('image')) {
        // Xóa ảnh cũ nếu có
        if ($house->image) {
            Storage::disk('public')->delete($house->image);
        }
        
        $validated['image'] = $request->file('image')->store('houses', 'public');
    } else {
        // ✅ QUAN TRỌNG: Bỏ image ra khỏi validated để không update
        unset($validated['image']);
    }

    $house->update($validated);

    return redirect()->route('landlord.houses.index')
        ->with('success', 'Cập nhật thành công!');
}

    /**
     * Cập nhật đơn giá điện, nước mặc định và cấu hình tài khoản ngân hàng VietQR của nhà trọ
     */
    public function updateUtilityPrices(Request $request, House $house)
    {
        $user = Auth::user();
        if (!$user->managesHouse($house) || ($user->role === 'staff' && !$user->hasPermission('houses.edit'))) {
            abort(403, 'Bạn không có quyền cập nhật nhà trọ này.');
        }

        $validated = $request->validate([
            'electric_price' => 'required|numeric|min:0',
            'water_price' => 'required|numeric|min:0',
            'bank_name' => 'nullable|string|max:255',
            'account_no' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
        ]);

        $house->update($validated);

        return redirect()->back()
            ->with('success', 'Cập nhật thiết lập thành công!');
    }

    /**
     * Xóa nhà trọ (xóa ảnh liên quan trong bộ nhớ storage)
     */
    public function destroy(House $house)
    {
        $user = Auth::user();
        // ✅ Chỉ landlord sở hữu hoặc staff được gán và có quyền delete mới được xóa
        if (!$user->managesHouse($house) || ($user->role === 'staff' && !$user->hasPermission('houses.delete'))) {
            abort(403, 'Bạn không có quyền xóa nhà trọ này.');
        }

        // Kiểm tra bảo mật: Không cho phép xóa nhà trọ nếu đang có phòng có hợp đồng active
        $hasActiveContracts = \App\Models\Contract::whereHas('room', function ($q) use ($house) {
            $q->where('house_id', $house->id);
        })->where('status', 'active')->exists();

        if ($hasActiveContracts) {
            return redirect()->back()->with('error', 'Không thể xóa nhà trọ vì đang có các phòng có người ở (hợp đồng đang hoạt động)!');
        }

        if ($house->image) {
            Storage::disk('public')->delete($house->image);
        }
        
        $house->delete();
        
        return redirect()->back()
            ->with('success', 'Xóa nhà trọ thành công!');
    }
}