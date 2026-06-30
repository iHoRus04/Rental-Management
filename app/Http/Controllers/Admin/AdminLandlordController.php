<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLandlordController extends Controller
{
    public function index()
    {
        $landlords = User::where('role', 'landlord')
            ->with(['activeSubscription.package'])
            ->withCount(['houses'])
            ->get()
            ->map(function ($user) {
                // Lấy số lượng phòng của landlord này
                $roomCount = \App\Models\Room::whereHas('house', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'houses_count' => $user->houses_count,
                    'rooms_count' => $roomCount,
                    'active_subscription' => $user->activeSubscription ? [
                        'package_name' => $user->activeSubscription->package->name ?? 'N/A',
                        'end_date' => $user->activeSubscription->end_date->format('d/m/Y'),
                        'room_limit' => $user->activeSubscription->package->room_limit ?? 0,
                    ] : null,
                    'created_at' => $user->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('Admin/Landlords/Index', [
            'landlords' => $landlords,
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,active,inactive',
        ]);

        if ($user->role !== 'landlord') {
            return redirect()->back()->with('error', 'Chỉ có thể thay đổi trạng thái của tài khoản Chủ trọ.');
        }

        $user->update(['status' => $validated['status']]);

        $statusLabels = [
            'active' => 'kích hoạt',
            'inactive' => 'khóa',
            'pending' => 'đặt trạng thái chờ phê duyệt',
        ];

        return redirect()->back()->with('success', "Tài khoản của chủ trọ {$user->name} đã được {$statusLabels[$validated['status']]} thành công.");
    }
}
