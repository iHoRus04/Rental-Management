<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPackageController extends Controller
{
    public function index()
    {
        $packages = Package::all();
        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'room_limit' => 'required|integer|min:1',
            'duration_value' => 'required|integer|min:1',
            'duration_type' => 'required|string|in:week,month,year,onetime',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $durationValue = $validated['duration_value'];
        $durationType = $validated['duration_type'];
        
        if ($durationType === 'onetime') {
            $validated['duration_value'] = 1;
            $validated['duration_months'] = 1200; // 100 years
        } elseif ($durationType === 'week') {
            $validated['duration_months'] = ceil($durationValue / 4);
        } elseif ($durationType === 'year') {
            $validated['duration_months'] = $durationValue * 12;
        } else {
            $validated['duration_months'] = $durationValue;
        }

        Package::create($validated);

        return redirect()->back()->with('success', 'Gói cước mới đã được tạo thành công.');
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'room_limit' => 'required|integer|min:1',
            'duration_value' => 'required|integer|min:1',
            'duration_type' => 'required|string|in:week,month,year,onetime',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $durationValue = $validated['duration_value'];
        $durationType = $validated['duration_type'];
        
        if ($durationType === 'onetime') {
            $validated['duration_value'] = 1;
            $validated['duration_months'] = 1200; // 100 years
        } elseif ($durationType === 'week') {
            $validated['duration_months'] = ceil($durationValue / 4);
        } elseif ($durationType === 'year') {
            $validated['duration_months'] = $durationValue * 12;
        } else {
            $validated['duration_months'] = $durationValue;
        }

        $package->update($validated);

        return redirect()->back()->with('success', "Gói cước {$package->name} đã được cập nhật thành công.");
    }

    public function destroy(Package $package)
    {
        // Kiểm tra xem có subscription nào đang dùng gói này không
        $activeSubCount = \App\Models\Subscription::where('package_id', $package->id)
            ->where('status', 'active')
            ->count();

        if ($activeSubCount > 0) {
            // Thay vì xóa, ta chuyển trạng thái hoạt động về false
            $package->update(['is_active' => false]);
            return redirect()->back()->with('warning', "Gói cước {$package->name} đang có người dùng đăng ký hoạt động. Hệ thống đã ẩn kích hoạt (ẩn đi) thay vì xóa hoàn toàn.");
        }

        $package->delete();
        return redirect()->back()->with('success', 'Gói cước đã được xóa thành công.');
    }
}
