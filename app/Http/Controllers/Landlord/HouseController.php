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

class HouseController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $houses = Auth::user()->houses()->latest()->get();
        
        if ($request->wantsJson()) {
            return response()->json([
                'houses' => $houses,
            ]);
        }
        
        return Inertia::render('Landlord/Houses/Index', [
            'houses' => $houses,
        ]);
    }

    public function show(House $house)
    {
        // ✅ Kiểm tra ownership
        if ($house->user_id !== Auth::id()) {
            abort(403, 'Bạn không có quyền truy cập nhà trọ này.');
        }

        return Inertia::render('Landlord/Houses/Show', [
            'house' => $house,
        ]);
    }

    public function create()
    {
        return Inertia::render('Landlord/Houses/Create');
    }

    public function store(Request $request)
    {
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

        Auth::user()->houses()->create($validated);

        return redirect()->route('landlord.houses.index')
            ->with('success', 'Tạo nhà trọ thành công!');
    }

    public function edit(House $house)
    {
        // ✅ Debug log
        Log::info('Edit House - Start', [
            'house_id' => $house->id,
            'house_user_id' => $house->user_id,
            'current_user_id' => Auth::id(),
            'house_data' => $house->toArray(),
        ]);

        // ✅ Kiểm tra ownership
        if ($house->user_id !== Auth::id()) {
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

    public function update(Request $request, House $house)
{
    // Kiểm tra ownership
    if ($house->user_id !== Auth::id()) {
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

    public function destroy(House $house)
    {
        // ✅ Kiểm tra ownership
        if ($house->user_id !== Auth::id()) {
            abort(403, 'Bạn không có quyền xóa nhà trọ này.');
        }

        if ($house->image) {
            Storage::disk('public')->delete($house->image);
        }
        
        $house->delete();
        
        return redirect()->back()
            ->with('success', 'Xóa nhà trọ thành công!');
    }
}