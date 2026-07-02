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

    public function show(User $user)
    {
        if ($user->role !== 'landlord') {
            abort(404);
        }

        // Lấy số lượng phòng của landlord này
        $roomCount = \App\Models\Room::whereHas('house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        $landlordDetails = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'created_at' => $user->created_at->format('d/m/Y H:i'),
        ];

        // Danh sách các tòa nhà
        $houses = \App\Models\House::where('user_id', $user->id)
            ->withCount('rooms')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($house) {
                return [
                    'id' => $house->id,
                    'name' => $house->name,
                    'type' => $house->type,
                    'address' => $house->address,
                    'rooms_count' => $house->rooms_count,
                    'created_at' => $house->created_at->format('d/m/Y'),
                ];
            });

        // Lịch sử đăng ký gói cước
        $subscriptions = \App\Models\Subscription::where('user_id', $user->id)
            ->with('package')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'package_name' => $sub->package->name ?? 'N/A',
                    'price_paid' => (float) $sub->price_paid,
                    'start_date' => $sub->start_date ? $sub->start_date->format('d/m/Y H:i') : 'N/A',
                    'end_date' => $sub->end_date ? $sub->end_date->format('d/m/Y') : 'N/A',
                    'status' => $sub->status,
                    'payment_status' => $sub->payment_status,
                    'created_at' => $sub->created_at->format('d/m/Y H:i'),
                ];
            });

        // Thống kê nhanh
        $stats = [
            'houses_count' => count($houses),
            'rooms_count' => $roomCount,
            'total_spent' => (float) \App\Models\Subscription::where('user_id', $user->id)->where('payment_status', 'paid')->sum('price_paid'),
        ];

        return Inertia::render('Admin/Landlords/Show', [
            'landlord' => $landlordDetails,
            'houses' => $houses,
            'subscriptions' => $subscriptions,
            'stats' => $stats,
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
