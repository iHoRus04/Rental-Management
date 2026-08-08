<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TenantRequest;

class TenantRequestController extends Controller
{
    /**
     * Hiển thị danh sách các phiếu sự cố/báo lỗi do khách thuê gửi
     */
    public function index()
    {
        $user = Auth::user();

        $requests = TenantRequest::where('tenant_id', $user->id)
            ->with(['room', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Tenant/Requests/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Hiển thị giao diện Form gửi phiếu báo lỗi/yêu cầu sửa chữa mới
     */
    public function create()
    {
        $user = Auth::user();
        
        // Get tenant's room info
        $renterRequest = $user->renterRequest;
        $contract = null;
        $room = null;
        $landlord = null;

        if ($renterRequest) {
            $contract = $renterRequest->contracts()
                ->where(function ($query) {
                    $query->where('end_date', '>=', now())
                          ->orWhereNull('end_date');
                })
                ->with('room.house.user')
                ->first();

            if ($contract) {
                $room = $contract->room;
                $landlord = $contract->room->house->user;
            }
        }

        if (!$landlord) {
            return redirect()->route('tenant.dashboard')
                ->with('error', 'Không tìm thấy thông tin chủ trọ!');
        }

        return Inertia::render('Tenant/Requests/Create', [
            'room' => $room,
            'landlord' => $landlord,
        ]);
    }

    /**
     * Lưu phiếu báo lỗi mới vào CSDL (tải lên hình ảnh/video bằng chứng) và gửi Mail cho chủ trọ
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Get landlord info
        $renterRequest = $user->renterRequest;
        if (!$renterRequest) {
            return back()->with('error', 'Không tìm thấy thông tin thuê phòng!');
        }

        $contract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->with('room.house')
            ->first();

        if (!$contract) {
            return back()->with('error', 'Không tìm thấy hợp đồng!');
        }

        $validated = $request->validate([
            'type' => 'required|in:maintenance,complaint,question,other',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'images' => 'nullable|array|max:5',
            'images.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webm|max:10240',
        ], [
            'images.max' => 'Bạn chỉ được đính kèm tối đa 5 hình ảnh hoặc video.',
            'images.*.mimes' => 'Định dạng file không hỗ trợ (chỉ hỗ trợ hình ảnh hoặc video).',
            'images.*.max' => 'Kích thước file tối đa là 10MB.',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('tenant_requests', 'public');
                $imagePaths[] = $path;
            }
        }

        $tenantRequest = TenantRequest::create([
            'tenant_id' => $user->id,
            'landlord_id' => $contract->room->house->user_id,
            'room_id' => $contract->room_id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'images' => $imagePaths,
            'status' => 'pending',
        ]);

        // Gửi email thông báo sự cố mới cho chủ nhà
        if ($tenantRequest->landlord && !empty($tenantRequest->landlord->email)) {
            try {
                \Illuminate\Support\Facades\Mail::to($tenantRequest->landlord->email)
                    ->send(new \App\Mail\TenantRequestCreatedMail($tenantRequest));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lỗi gửi mail báo sự cố mới: ' . $e->getMessage());
            }
        }

        return redirect()->route('tenant.dashboard')
            ->with('success', 'Yêu cầu đã được gửi thành công!');
    }

    /**
     * Xem chi tiết phiếu báo sự cố (xem bằng chứng nghiệm thu từ nhân viên/chủ trọ)
     */
    public function show(TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->tenant_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        $tenantRequest->load(['room.house', 'landlord', 'assignedTo']);

        return Inertia::render('Tenant/Requests/Show', [
            'request' => $tenantRequest,
        ]);
    }

    /**
     * Khách thuê xác nhận nghiệm thu hài lòng và đóng phiếu sự cố (status = closed)
     */
    public function close(TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->tenant_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($tenantRequest->status !== 'resolved') {
            return redirect()->back()->with('error', 'Chỉ có thể đóng các yêu cầu đã được giải quyết!');
        }

        $tenantRequest->update([
            'status' => 'closed',
        ]);

        return redirect()->back()->with('success', 'Đã xác nhận hoàn tất và đóng yêu cầu thành công!');
    }

    /**
     * Khách thuê từ chối kết quả sửa chữa và yêu cầu làm lại (chuyển status về in_progress)
     */
    public function reject(Request $request, TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->tenant_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($tenantRequest->status !== 'resolved') {
            return redirect()->back()->with('error', 'Chỉ có thể từ chối các yêu cầu đã hoàn thành sửa chữa!');
        }

        $validated = $request->validate([
            'reject_reason' => 'required|string|max:1000',
        ], [
            'reject_reason.required' => 'Vui lòng nhập lý do từ chối nghiệm thu.',
            'reject_reason.max' => 'Lý do từ chối không được vượt quá 1000 ký tự.',
        ]);

        // Revert status to in_progress and append reject log to description
        $tenantRequest->update([
            'status' => 'in_progress',
            'description' => $tenantRequest->description . "\n\n[Yêu cầu sửa lại ngày " . now()->format('d/m/Y H:i') . ": " . $validated['reject_reason'] . "]",
        ]);

        return redirect()->back()->with('success', 'Đã từ chối nghiệm thu và yêu cầu sửa chữa lại thành công!');
    }
}
