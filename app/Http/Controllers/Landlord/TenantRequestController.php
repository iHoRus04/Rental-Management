<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TenantRequest;

class TenantRequestController extends Controller
{
    private function authorizeRequestAction(TenantRequest $tenantRequest, string $action = 'view')
    {
        $user = Auth::user();

        if ($tenantRequest->landlord_id != $user->getLandlordId() || ($tenantRequest->room && !$user->managesHouse($tenantRequest->room->house_id))) {
            abort(403, 'Unauthorized');
        }

        if ($user->role === 'staff') {
            if (!$user->hasPermission("tenant_requests.{$action}")) {
                abort(403, 'Bạn không có quyền thực hiện thao tác này.');
            }
        }
    }

    /**
     * Hiển thị danh sách các phiếu yêu cầu sửa chữa/báo lỗi từ người thuê
     */
    public function index(Request $request)
    {
        $user     = Auth::user();
        if ($user->role === 'staff' && !$user->hasPermission('tenant_requests.view')) {
            abort(403, 'Bạn không có quyền thực hiện thao tác này.');
        }

        $houseIds = $user->getAccessibleHouseIds();

        $houses = \App\Models\House::whereIn('id', $houseIds)->withCount('rooms')->get();

        $requests = TenantRequest::where('landlord_id', $user->getLandlordId())
            ->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->with(['tenant', 'room.house', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'requests' => $requests,
                'houses'   => $houses,
            ]);
        }

        return Inertia::render('Landlord/TenantRequests/Index', [
            'requests' => $requests,
            'houses'   => $houses,
        ]);
    }

    /**
     * Xem chi tiết phiếu yêu cầu báo lỗi (kèm danh sách nhân viên kỹ thuật có thể phân công)
     */
    public function show(TenantRequest $tenantRequest)
    {
        $this->authorizeRequestAction($tenantRequest, 'view');
        $user = Auth::user();

        $tenantRequest->load(['tenant', 'room.house', 'assignedTo']);

        $houseId = $tenantRequest->room ? $tenantRequest->room->house_id : null;

        $staffMembers = \App\Models\User::where('role', 'staff')
            ->where('landlord_id', $user->getLandlordId())
            ->when($houseId, function ($q) use ($houseId) {
                $q->whereHas('staffedHouses', function ($sub) use ($houseId) {
                    $sub->where('houses.id', $houseId);
                });
            })
            ->get(['id', 'name', 'phone']);

        $landlord = \App\Models\User::find($user->getLandlordId(), ['id', 'name', 'phone']);
        if ($landlord) {
            $landlord->name = $landlord->name . ' (Chủ nhà)';
            $staffMembers->prepend($landlord);
        }

        return Inertia::render('Landlord/TenantRequests/Show', [
            'request' => $tenantRequest,
            'staffMembers' => $staffMembers,
        ]);
    }

    /**
     * Cập nhật trạng thái tiến độ xử lý phiếu sự cố (pending -> in_progress -> resolved -> closed)
     */
    public function updateStatus(Request $request, TenantRequest $tenantRequest, $status)
    {
        $this->authorizeRequestAction($tenantRequest, 'edit');

        $validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];

        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Trạng thái không hợp lệ!');
        }

        // If status is changed to in_progress, automatically set responded_at if not set
        $updateData = ['status' => $status];
        if ($status === 'in_progress' && !$tenantRequest->responded_at) {
            $updateData['responded_at'] = now();
        }

        $tenantRequest->update($updateData);

        // Gửi email cập nhật tiến độ
        $this->sendRequestUpdatedEmail($tenantRequest);

        return redirect()->back()->with('success', 'Cập nhật trạng thái thành công!');
    }

    /**
     * Phân công nhân viên bảo trì/kỹ thuật phụ trách xử lý sự cố
     */
    public function assign(Request $request, TenantRequest $tenantRequest)
    {
        $this->authorizeRequestAction($tenantRequest, 'edit');
        $user = Auth::user();

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $assignedUser = \App\Models\User::findOrFail($validated['assigned_to']);
        
        $isLandlord = ($assignedUser->id === $user->getLandlordId());
        $isStaff = ($assignedUser->landlord_id === $user->getLandlordId() && $assignedUser->role === 'staff');

        if (!$isLandlord && !$isStaff) {
            return redirect()->back()->with('error', 'Người phụ trách sửa chữa được chọn không hợp lệ!');
        }

        $houseId = $tenantRequest->room ? $tenantRequest->room->house_id : null;
        if ($isStaff && $houseId && !$assignedUser->managesHouse($houseId)) {
            return redirect()->back()->with('error', 'Nhân viên được chọn không phụ trách nhà trọ này!');
        }

        $tenantRequest->update([
            'assigned_to' => $assignedUser->id,
            'status' => 'in_progress', // Auto transition to in_progress
        ]);

        // Gửi email cập nhật tiến độ
        $this->sendRequestUpdatedEmail($tenantRequest);

        return redirect()->back()->with('success', 'Đã phân công người phụ trách và chuyển trạng thái sang Đang xử lý!');
    }

    /**
     * Nghiệm thu hoàn thành sửa chữa (tải lên hình ảnh/video bằng chứng nghiệm thu)
     */
    public function resolve(Request $request, TenantRequest $tenantRequest)
    {
        $this->authorizeRequestAction($tenantRequest, 'edit');

        $validated = $request->validate([
            'resolved_images' => 'required|array|min:1|max:5',
            'resolved_images.*' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webm|max:10240',
            'landlord_response' => 'nullable|string',
        ], [
            'resolved_images.required' => 'Bạn phải tải lên ít nhất 1 ảnh/video nghiệm thu kết quả sửa chữa.',
            'resolved_images.min' => 'Bạn phải tải lên ít nhất 1 ảnh/video nghiệm thu kết quả sửa chữa.',
            'resolved_images.max' => 'Bạn chỉ được đính kèm tối đa 5 ảnh hoặc video nghiệm thu.',
            'resolved_images.*.mimes' => 'Định dạng file không hỗ trợ (chỉ hỗ trợ hình ảnh/video).',
            'resolved_images.*.max' => 'Kích thước file tối đa là 10MB.',
        ]);

        $imagePaths = [];
        if ($request->hasFile('resolved_images')) {
            foreach ($request->file('resolved_images') as $file) {
                $path = $file->store('tenant_requests_resolved', 'public');
                $imagePaths[] = $path;
            }
        }

        $tenantRequest->update([
            'status' => 'resolved',
            'resolved_images' => $imagePaths,
            'landlord_response' => $validated['landlord_response'] ?? $tenantRequest->landlord_response,
            'responded_at' => now(),
        ]);

        // Gửi email cập nhật tiến độ
        $this->sendRequestUpdatedEmail($tenantRequest);

        return redirect()->back()->with('success', 'Yêu cầu đã được sửa chữa thành công và chờ nghiệm thu!');
    }

    /**
     * Gửi câu trả lời / phản hồi thông tin cho người thuê
     */
    public function respond(Request $request, TenantRequest $tenantRequest)
    {
        $this->authorizeRequestAction($tenantRequest, 'edit');

        $validated = $request->validate([
            'response' => 'required|string',
        ]);

        $tenantRequest->update([
            'landlord_response' => $validated['response'],
            'responded_at' => now(),
            'status' => 'in_progress',
        ]);

        // Gửi email cập nhật tiến độ
        $this->sendRequestUpdatedEmail($tenantRequest);

        return redirect()->back()->with('success', 'Đã gửi phản hồi!');
    }

    /**
     * Helper gửi email cập nhật sự cố cho khách thuê
     */
    private function sendRequestUpdatedEmail(TenantRequest $tenantRequest)
    {
        $tenantRequest->loadMissing(['tenant', 'landlord']);

        if ($tenantRequest->tenant && !empty($tenantRequest->tenant->email)) {
            try {
                \Illuminate\Support\Facades\Mail::to($tenantRequest->tenant->email)
                    ->send(new \App\Mail\TenantRequestUpdatedMail($tenantRequest));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lỗi gửi mail cập nhật sự cố: ' . $e->getMessage());
            }
        }
    }
}
