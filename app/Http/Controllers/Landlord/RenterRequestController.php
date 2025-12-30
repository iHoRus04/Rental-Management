<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RenterRequest;
use App\Models\Renter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RenterRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get renter requests for houses owned by this landlord
        $requests = RenterRequest::with('room.house')
            ->whereHas('room.house', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Return JSON response for API calls
        if ($request->wantsJson()) {
            return response()->json([
                'requests' => $requests
            ]);
        }

        return Inertia::render('Landlord/RenterRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function show(RenterRequest $renterRequest)
    {
        $renterRequest->load('room.house');
        
        return Inertia::render('Landlord/RenterRequests/Show', [
            'renterRequest' => $renterRequest,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        // Get all rooms for this landlord
        $rooms = \App\Models\Room::with('house')
            ->whereHas('house', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();

        return Inertia::render('Landlord/RenterRequests/Create', [
            'rooms' => $rooms,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'room_id' => 'required|exists:rooms,id',
            'message' => 'nullable|string',
        ]);

        // Ensure the landlord owns the selected room
        $room = \App\Models\Room::findOrFail($validated['room_id']);
        if ($room->house->user_id != $user->id) {
            return back()->withErrors(['room_id' => 'Bạn không có quyền chọn phòng này!']);
        }

        // Set default status to 'new' and create
        $validated['status'] = 'new';
        RenterRequest::create($validated);

        return redirect()->route('landlord.renter-requests.index')
                        ->with('success', 'Tạo yêu cầu thuê phòng thành công!');
    }

    public function updateStatus(Request $httpRequest, RenterRequest $renterRequest, $status)
    {
        $user = Auth::user();
        
        // Ensure the landlord owns the house associated with this request
        if ($renterRequest->room && $renterRequest->room->house) {
            if ($renterRequest->room->house->user_id != $user->id) {
                return redirect()->back()->with('error', 'Bạn không có quyền cập nhật yêu cầu này!');
            }
        } else {
            return redirect()->back()->with('error', 'Không tìm thấy thông tin nhà cho yêu cầu này!');
        }

        $validStatuses = ['new', 'contacted', 'approved', 'rejected'];
        
        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Trạng thái không hợp lệ!');
        }

        // Simply update status
        $renterRequest->update(['status' => $status]);

        return redirect()->back()->with('success', 'Cập nhật trạng thái yêu cầu thành công!');
    }
    
    /**
     * Get pending renter requests count for dashboard
     */
    public function getPendingCount()
    {
        $user = Auth::user();
        
        $count = RenterRequest::where('status', 'new')
            ->whereHas('room.house', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();

        return response()->json(['count' => $count]);
    }
}