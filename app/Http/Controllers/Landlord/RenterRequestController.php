<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RenterRequest;
use App\Models\Renter;
use App\Models\Service;
use App\Models\RenterRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * RenterRequestController
 *
 * Xá»­ lÃ½ cÃ¡c yÃªu cáº§u thuÃª phÃ²ng tá»« khÃ¡ch (renter requests): táº¡o, xem, thay Ä‘á»•i tráº¡ng thÃ¡i.
 * - Äáº£m báº£o landlord Ä‘ang sá»Ÿ há»¯u phÃ²ng khi thao tÃ¡c (quyá»n sá»Ÿ há»¯u/kiá»ƒm tra phÃ²ng).
 */
class RenterRequestController extends Controller
{
    public function index(Request $request)
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();

        $houses = \App\Models\House::whereIn('id', $houseIds)->withCount('rooms')->get();

        $requests = RenterRequest::with(['room.house', 'contracts' => function ($query) {
                $query->where('end_date', '>=', now())
                       ->orWhereNull('end_date');
            }])
            ->whereHas('room', function ($query) use ($houseIds) {
                $query->whereIn('house_id', $houseIds);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($renterRequest) {
                $renterRequest->has_active_contract = $renterRequest->contracts->count() > 0;
                $renterRequest->has_user_account    = \App\Models\User::where('renter_request_id', $renterRequest->id)->exists();
                return $renterRequest;
            });

        if ($request->wantsJson()) {
            return response()->json([
                'requests' => $requests,
                'houses'   => $houses,
            ]);
        }

        return Inertia::render('Landlord/RenterRequests/Index', [
            'requests' => $requests,
            'houses'   => $houses,
        ]);
    }

    public function show(RenterRequest $renterRequest)
    {
        $renterRequest->load(['room.house', 'contracts' => function ($query) {
            $query->where('end_date', '>=', now())
                  ->orWhereNull('end_date');
        }]);
        
        // Check if has active contract
        $hasActiveContract = $renterRequest->contracts->count() > 0;
        
        // Get user account if exists
        $tenantAccount = \App\Models\User::where('renter_request_id', $renterRequest->id)->first();
        
        return Inertia::render('Landlord/RenterRequests/Show', [
            'renterRequest' => $renterRequest,
            'hasActiveContract' => $hasActiveContract,
            'tenantAccount' => $tenantAccount,
        ]);
    }

    public function create()
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();

        $rooms = \App\Models\Room::with('house')
            ->whereIn('house_id', $houseIds)
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

        // Đảm bảo user có quyền chọn phòng này
        $room = \App\Models\Room::findOrFail($validated['room_id']);
        if (!$user->managesHouse($room->house_id)) {
            return back()->withErrors(['room_id' => 'Bạn không có quyền chọn phòng này!']);
        }

        // Set default status to 'new' and create
        $validated['status'] = 'new';
        RenterRequest::create($validated);

        return redirect()->route('landlord.renter-requests.index')
                        ->with('success', 'Táº¡o yÃªu cáº§u thuÃª phÃ²ng thÃ nh cÃ´ng!');
    }

    public function updateStatus(Request $httpRequest, RenterRequest $renterRequest, $status)
    {
        $user = Auth::user();
        
        // Ensure the landlord owns the house associated with this request
        // (náº¿u khÃ´ng cÃ³ room hoáº·c house thÃ¬ tráº£ vá»  lá»—i rÃµ rÃ ng)
        if ($renterRequest->room && $renterRequest->room->house) {
            if (!$user->managesHouse($renterRequest->room->house)) {
                return redirect()->back()->with('error', 'Bạn không có quyền cập nhật yêu cầu này!');
            }
        } else {
            return redirect()->back()->with('error', 'KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin nhÃ  cho yÃªu cáº§u nÃ y!');
        }

        $validStatuses = ['new', 'contacted', 'approved', 'rejected'];
        
        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡!');
        }

        // Simply update status
        $renterRequest->update(['status' => $status]);

        return redirect()->back()->with('success', 'Cáº­p nháº­t tráº¡ng thÃ¡i yÃªu cáº§u thÃ nh cÃ´ng!');
    }
    
    /**
     * Get pending renter requests count for dashboard
     */
    public function getPendingCount()
    {
        $user = Auth::user();
        
        $count = RenterRequest::where('status', 'new')
            ->whereHas('room.house', function ($query) use ($user) {
                $query->whereIn('id', $user->getAccessibleHouseIds());
            })
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Display services for a specific renter request
     */
    public function renterRequestServices(RenterRequest $renterRequest)
    {
        $user = Auth::user();
        
        // Check ownership
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        // Only allow service management for approved requests with active contract
        if ($renterRequest->status !== 'approved') {
            return redirect()->route('landlord.renter-requests.index')
                ->with('error', 'Chá»‰ cÃ³ thá»ƒ gÃ¡n dá»‹ch vá»¥ cho khÃ¡ch hÃ ng Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t!');
        }

        // Check if renter has active contract
        $hasActiveContract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->exists();

        if (!$hasActiveContract) {
            return redirect()->route('landlord.renter-requests.index')
                ->with('error', 'Chá»‰ cÃ³ thá»ƒ gÃ¡n dá»‹ch vá»¥ cho khÃ¡ch hÃ ng Ä‘ang thuÃª phÃ²ng (cÃ³ há»£p Ä‘á»“ng hoáº¡t Ä‘á»™ng)!');
        }

        $renterRequest->load(['services', 'room.house']);
        $allServices = Service::where('is_active', true)->get();

        return Inertia::render('Landlord/RenterRequests/RenterRequestServices', [
            'renterRequest' => $renterRequest,
            'renterRequestServices' => $renterRequest->services,
            'allServices' => $allServices,
        ]);
    }

    /**
     * Attach service to renter request
     */
    public function attachService(Request $request, RenterRequest $renterRequest)
    {
        $user = Auth::user();
        
        // Check ownership
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        // Check if approved and has active contract
        if ($renterRequest->status !== 'approved') {
            return redirect()->back()->with('error', 'Chá»‰ cÃ³ thá»ƒ gÃ¡n dá»‹ch vá»¥ cho khÃ¡ch hÃ ng Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t!');
        }

        $hasActiveContract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->exists();

        if (!$hasActiveContract) {
            return redirect()->back()->with('error', 'Chá»‰ cÃ³ thá»ƒ gÃ¡n dá»‹ch vá»¥ cho khÃ¡ch hÃ ng Ä‘ang thuÃª phÃ²ng!');
        }

        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $renterRequest->services()->attach($validated['service_id'], [
            'price' => $validated['price'],
            'note' => $validated['note'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Dá»‹ch vá»¥ Ä‘Ã£ Ä‘Æ°á»£c thÃªm!');
    }

    /**
     * Update renter request service
     */
    public function updateRenterRequestService(Request $request, RenterRequestService $renterRequestService)
    {
        $user = Auth::user();
        
        // Check ownership
        $renterRequest = $renterRequestService->renterRequest;
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'note' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $renterRequestService->update($validated);

        return redirect()->back()->with('success', 'Dá»‹ch vá»¥ Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t!');
    }

    /**
     * Detach service from renter request
     */
    public function detachService(RenterRequestService $renterRequestService)
    {
        $user = Auth::user();
        
        // Check ownership
        $renterRequest = $renterRequestService->renterRequest;
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        $renterRequestService->delete();

        return redirect()->back()->with('success', 'Dịch vụ đã được xóa!');
    }

    /**
     * Create tenant account for approved renter request
     */
    public function createTenantAccount(RenterRequest $renterRequest)
    {
        $user = Auth::user();
        
        // Check ownership
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        // Check if already has user account
        if (\App\Models\User::where('renter_request_id', $renterRequest->id)->exists()) {
            return redirect()->back()->with('error', 'Tài khoản đã tồn tại cho khách hàng này!');
        }

        // Check if approved and has active contract
        if ($renterRequest->status !== 'approved') {
            return redirect()->back()->with('error', 'Chỉ tạo tài khoản cho khách hàng đã được duyệt!');
        }

        $hasActiveContract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->exists();

        if (!$hasActiveContract) {
            return redirect()->back()->with('error', 'Khách hàng phải có hợp đồng để tạo tài khoản!');
        }

        // Generate email - ensure it's unique
        $email = $renterRequest->email;
        
        // If no email or email already exists, generate a unique one
        if (!$email || \App\Models\User::where('email', $email)->exists()) {
            $baseEmail = $renterRequest->phone . '@tenant.local';
            $email = $baseEmail;
            $counter = 1;
            
            // Keep incrementing counter until we find a unique email
            while (\App\Models\User::where('email', $email)->exists()) {
                $email = $renterRequest->phone . '.' . $counter . '@tenant.local';
                $counter++;
            }
        }

        // Sử dụng số điện thoại làm mật khẩu mặc định (dễ nhớ cho chủ nhà)
        $password = $renterRequest->phone;

        // Create user account - Laravel tự động dùng email để đăng nhập
        $tenantUser = \App\Models\User::create([
            'name' => $renterRequest->name,  // Tên thật của người thuê
            'email' => $email,  // Email dùng để đăng nhập
            'password' => bcrypt($password),
            'role' => 'tenant',
            'renter_request_id' => $renterRequest->id,
        ]);

        return redirect()->back()->with('success', 'Tài khoản đã được tạo! Đăng nhập bằng Email: ' . $email . ' | Mật khẩu: ' . $password . ' (Số điện thoại)');
    }
}
