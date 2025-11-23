<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RenterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RenterRequestApiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'room_id' => 'nullable|exists:rooms,id',
            'message' => 'nullable|string'
        ]);

        $validated['status'] = 'new'; // Đảm bảo status luôn là 'new' khi tạo mới
        $requestData = RenterRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Gửi yêu cầu thành công. Chủ nhà sẽ liên hệ bạn sớm!',
            'data' => $requestData
        ]);
    }
    
    public function getPendingCount(Request $request)
    {
        // Check if user is authenticated and is a landlord
        if (!Auth::check() || Auth::user()->role !== 'landlord') {
            return response()->json(['count' => 0], 403);
        }
        
        $user = Auth::user();
        
        // Get count of new requests for houses owned by this landlord
        $count = RenterRequest::where('status', 'new')
            ->whereHas('room.house', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();
        
        return response()->json([
            'count' => $count
        ]);
    }
}