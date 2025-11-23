<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RenterRequest;
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

    public function show(RenterRequest $request)
    {
        $request->load('room.house');
        
        return Inertia::render('Landlord/RenterRequests/Show', [
            'renterRequest' => $request,
        ]);
    }

    public function updateStatus(Request $request, RenterRequest $renterRequest)
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

        $status = $request->input('status');
        $validStatuses = ['new', 'contacted', 'approved', 'rejected'];
        
        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Trạng thái không hợp lệ!');
        }

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