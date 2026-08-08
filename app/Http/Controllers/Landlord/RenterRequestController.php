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
 * Xử lý các yêu cầu thuê phòng từ khách (renter requests): tạo mới, xem chi tiết, cập nhật trạng thái,
 * cấp tài khoản app người thuê, gán dịch vụ đi kèm và lưu trữ/khôi phục dữ liệu.
 */
class RenterRequestController extends Controller
{
    /**
     * Hiển thị danh sách các yêu cầu thuê / khách thuê (phân loại theo tab)
     */
    public function index(Request $request)
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();

        $houses = \App\Models\House::whereIn('id', $houseIds)->withCount('rooms')->get();

        // Luôn load cả bản ghi đã xóa mềm để hỗ trợ phân loại tab Đã lưu trữ/Khách cũ
        $requests = RenterRequest::withTrashed()
            ->with(['room.house', 'contracts'])
            ->whereHas('room', function ($query) use ($houseIds) {
                $query->whereIn('house_id', $houseIds);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($renterRequest) {
                // Hợp đồng đang hoạt động
                $hasActiveContract = $renterRequest->contracts->where('status', 'active')->count() > 0;
                
                // Có lịch sử hợp đồng nhưng tất cả đã kết thúc (expired hoặc terminated)
                $hasContracts = $renterRequest->contracts->count() > 0;
                $isFormerTenant = $hasContracts && !$hasActiveContract;

                $renterRequest->has_active_contract = $hasActiveContract;
                $renterRequest->is_former_tenant    = $isFormerTenant;
                $renterRequest->has_user_account    = \App\Models\User::where('renter_request_id', $renterRequest->id)->exists();
                $renterRequest->is_archived         = $renterRequest->trashed();
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
            'filters'  => [
                'show_archived' => $request->get('show_archived') === 'true',
            ]
        ]);
    }

    /**
     * Xem thông tin chi tiết của một yêu cầu thuê / khách thuê
     */
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

    /**
     * Hiển thị trang giao diện tạo mới yêu cầu thuê phòng (chủ trọ nhập thủ công)
     */
    public function create(Request $request)
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();

        $rooms = \App\Models\Room::with('house')
            ->whereIn('house_id', $houseIds)
            ->get();

        return Inertia::render('Landlord/RenterRequests/Create', [
            'rooms' => $rooms,
            'selected_room_id' => $request->get('room_id'),
            'redirect_to_contract' => $request->get('redirect_to_contract') === 'true',
        ]);
    }

    /**
     * Lưu thông tin yêu cầu thuê phòng mới vào CSDL và tự động duyệt
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'regex:/^(03|05|07|08|09)\d{8}$/'],
            'email' => 'nullable|email|max:255',
            'room_id' => 'required|exists:rooms,id',
            'message' => 'nullable|string',
            'id_card' => ['nullable', 'string', 'regex:/^(\d{9}|\d{12})$/'],
            'address' => 'nullable|string|max:500',
            'move_in_date' => 'nullable|date',
        ], [
            'phone.regex' => 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).',
            'id_card.regex' => 'Số CCCD/CMND không hợp lệ (phải gồm đúng 9 hoặc 12 chữ số).',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
        ]);

        // Đảm bảo user có quyền chọn phòng này
        $room = \App\Models\Room::findOrFail($validated['room_id']);
        if (!$user->managesHouse($room->house_id)) {
            return back()->withErrors(['room_id' => 'Bạn không có quyền chọn phòng này!']);
        }

        // Set default status to 'approved' for requests created directly by the landlord
        $validated['status'] = 'approved';
        $renterRequest = RenterRequest::create($validated);
        
        if ($request->get('redirect_to_contract') === 'true') {
            return redirect()->route('landlord.rooms.contracts.create', $room->id)
                ->with('success', 'Tạo thông tin khách thuê thành công! Tiến hành tạo hợp đồng.');
        }

        return redirect()->route('landlord.renter-requests.index')
                        ->with('success', 'Tạo yêu cầu thuê phòng thành công và tự động duyệt!');
    }

    /**
     * Cập nhật tiến trình trạng thái yêu cầu (new -> contacted -> approved -> rejected)
     */
    public function updateStatus(Request $httpRequest, RenterRequest $renterRequest, $status)
    {
        $user = Auth::user();
        
        // Ensure the landlord owns the house associated with this request
        $room = $renterRequest->room;
        $house = $room ? $room->house : null;

        if ($house) {
            if (!$user->managesHouse($house)) {
                return redirect()->back()->with('error', 'Bạn không có quyền cập nhật yêu cầu này!');
            }
        } else {
            return redirect()->back()->with('error', 'Không tìm thấy thông tin nhà/phòng cho yêu cầu này!');
        }

        $validStatuses = ['new', 'contacted', 'approved', 'rejected'];
        
        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Trạng thái không hợp lệ!');
        }

        // Nếu từ chối, xóa vĩnh viễn luôn khỏi database
        if ($status === 'rejected') {
            // Ràng buộc bảo mật: Không cho phép xóa nếu đã từng làm hợp đồng
            if ($renterRequest->contracts()->exists()) {
                return redirect()->back()->with('error', 'Không thể xóa khách thuê này vì họ đã có lịch sử hợp đồng. Vui lòng chấm dứt hợp đồng thay vì xóa.');
            }

            $renterRequest->forceDelete();
            return redirect()->route('landlord.renter-requests.index')
                ->with('success', 'Đã từ chối và xóa vĩnh viễn yêu cầu thuê phòng.');
        }

        // Cập nhật các trạng thái khác bình thường
        $renterRequest->update(['status' => $status]);

        return redirect()->back()->with('success', 'Cập nhật trạng thái yêu cầu thành công!');
    }
    
    /**
     * Lấy số lượng các yêu cầu thuê phòng mới gửi (dùng cho badge thông báo trên Menu)
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
     * Hiển thị trang quản lý các dịch vụ bổ sung gán riêng cho khách thuê
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
                ->with('error', 'Chỉ có thể gán dịch vụ cho khách hàng đã được duyệt!');
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
                ->with('error', 'Chỉ có thể gán dịch vụ cho khách hàng đang thuê phòng (có hợp đồng hoạt động)!');
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
     * Gán thêm một dịch vụ mới cho khách thuê (kèm đơn giá riêng/ghi chú)
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
            return redirect()->back()->with('error', 'Chỉ có thể gán dịch vụ cho khách hàng đã được duyệt!');
        }

        $hasActiveContract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->exists();

        if (!$hasActiveContract) {
            return redirect()->back()->with('error', 'Chỉ có thể gán dịch vụ cho khách hàng đang thuê phòng!');
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

        return redirect()->back()->with('success', 'Dịch vụ đã được thêm!');
    }

    /**
     * Cập nhật thông tin dịch vụ riêng của khách (giá, ghi chú, trạng thái kích hoạt)
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

        return redirect()->back()->with('success', 'Dịch vụ đã được cập nhật!');
    }

    /**
     * Gỡ/Xóa dịch vụ ra khỏi khách thuê
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
     * Tự động cấp tài khoản đăng nhập ứng dụng cho Khách thuê (mật khẩu = Số điện thoại)
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
            'status' => 'active',
            'renter_request_id' => $renterRequest->id,
            'email_verified_at' => now(), // Tự động xác thực tài khoản do chủ trọ tạo trực tiếp
        ]);

        return redirect()->back()->with('success', 'Tài khoản đã được tạo! Đăng nhập bằng Email: ' . $email . ' | Mật khẩu: ' . $password . ' (Số điện thoại)');
    }

    /**
     * Lưu trữ (Xóa mềm) yêu cầu thuê phòng
     */
    public function destroy(RenterRequest $renterRequest)
    {
        $user = Auth::user();

        // Kiểm tra quyền sở hữu
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        // Ràng buộc bảo mật: Không cho phép xóa nếu đã từng có hợp đồng
        if ($renterRequest->contracts()->exists()) {
            return redirect()->back()->with('error', 'Không thể xóa khách thuê này vì họ đã có lịch sử hợp đồng. Vui lòng chấm dứt hợp đồng thay vì xóa.');
        }

        // Thực hiện xóa mềm
        $renterRequest->delete();

        // Khóa tài khoản tenant liên kết nếu có
        \App\Models\User::where('renter_request_id', $renterRequest->id)
            ->where('role', 'tenant')
            ->update(['status' => 'inactive']);

        return redirect()->route('landlord.renter-requests.index')
            ->with('success', 'Đã di chuyển yêu cầu thuê phòng vào mục lưu trữ.');
    }

    /**
     * Khôi phục yêu cầu thuê phòng đã lưu trữ
     */
    public function restore($id)
    {
        $user = Auth::user();
        $renterRequest = RenterRequest::onlyTrashed()->findOrFail($id);

        // Kiểm tra quyền sở hữu
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        $renterRequest->restore();

        return redirect()->back()->with('success', 'Đã khôi phục yêu cầu thuê phòng.');
    }

    /**
     * Hiển thị trang chỉnh sửa thông tin khách thuê
     */
    public function edit(RenterRequest $renterRequest)
    {
        $user     = Auth::user();
        $houseIds = $user->getAccessibleHouseIds();

        // Kiểm tra quyền sở hữu
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        $rooms = \App\Models\Room::with('house')
            ->whereIn('house_id', $houseIds)
            ->get();

        return Inertia::render('Landlord/RenterRequests/Edit', [
            'renterRequest' => $renterRequest,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Cập nhật thông tin khách thuê
     */
    public function update(Request $request, RenterRequest $renterRequest)
    {
        $user = Auth::user();
        
        // Kiểm tra quyền sở hữu
        if ($renterRequest->room && $renterRequest->room->house && !$user->managesHouse($renterRequest->room->house)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'regex:/^(03|05|07|08|09)\d{8}$/'],
            'email' => 'nullable|email|max:255',
            'room_id' => 'required|exists:rooms,id',
            'message' => 'nullable|string',
            'id_card' => ['nullable', 'string', 'regex:/^(\d{9}|\d{12})$/'],
            'address' => 'nullable|string|max:500',
            'move_in_date' => 'nullable|date',
        ], [
            'phone.regex' => 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).',
            'id_card.regex' => 'Số CCCD/CMND không hợp lệ (phải gồm đúng 9 hoặc 12 chữ số).',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
        ]);

        // Đảm bảo user có quyền chọn phòng này
        $room = \App\Models\Room::findOrFail($validated['room_id']);
        if (!$user->managesHouse($room->house_id)) {
            return back()->withErrors(['room_id' => 'Bạn không có quyền chọn phòng này!']);
        }

        $renterRequest->update($validated);

        // Đồng bộ thông tin tài khoản đăng nhập nếu có
        \App\Models\User::where('renter_request_id', $renterRequest->id)
            ->where('role', 'tenant')
            ->update([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? $renterRequest->email,
            ]);

        return redirect()->route('landlord.renter-requests.show', $renterRequest->id)
            ->with('success', 'Cập nhật thông tin khách thuê thành công!');
    }
}
