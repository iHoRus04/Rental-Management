<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\MeterLog;
use App\Models\Room;
use App\Models\RenterRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContractCreatedMail;
use Inertia\Inertia;

/**
 * ContractController
 *
 * Quản lý hợp đồng cho từng phòng: hiển thị, tạo, cập nhật, xóa.
 * Controller chuẩn hóa dữ liệu trả về cho frontend (Inertia) và
 * chịu trách nhiệm cập nhật trạng thái phòng (ví dụ: occupied/available)
 * khi trạng thái hợp đồng thay đổi.
 */
class ContractController extends Controller
{
    private function authorizeContractAction(Room $room, string $action = 'view')
    {
        $user = auth()->user();
        if (!$user->managesHouse($room->house_id)) {
            abort(403, 'Bạn không có quyền truy cập nhà trọ này.');
        }

        if ($user->role === 'staff') {
            if (!$user->hasPermission("contracts.{$action}")) {
                abort(403, 'Bạn không có quyền thực hiện thao tác này.');
            }
        }
    }

    /**
     * Hiển thị danh sách tất cả các hợp đồng thuê của một phòng trọ
     */
    public function index(Room $room)
    {
        $this->authorizeContractAction($room, 'view');
        
        $contracts = $room->contracts()
            ->with('renterRequest')
            ->latest()
            ->get()
            ->map(function($contract) {
                return [
                    'id' => $contract->id,
                    'room_id' => $contract->room_id,
                    'renter_request_id' => $contract->renter_request_id,
                    'start_date' => $contract->start_date,
                    'end_date' => $contract->end_date,
                    'monthly_rent' => $contract->monthly_rent,
                    'deposit' => $contract->deposit,
                    'payment_date' => $contract->payment_date,
                    'status' => $contract->status,
                    'renterRequest' => $contract->renterRequest,
                ];
            });

        return Inertia::render('Landlord/Contracts/Index', [
            'room' => $room->load('house'),
            'contracts' => $contracts,
        ]);
    }

    /**
     * Hiển thị giao diện Form tạo mới hợp đồng thuê phòng
     */
    public function create(Room $room)
    {
        $this->authorizeContractAction($room, 'create');
        
        // Lấy danh sách RenterRequest của phòng này với trạng thái 'approved'
        $renterRequests = RenterRequest::where('room_id', $room->id)
            ->where('status', 'approved')
            ->select(['id', 'name', 'phone', 'email', 'status'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Landlord/Contracts/Create', [
            'room' => $room->load('house'),
            'renterRequests' => $renterRequests,
        ]);
    }

    /**
     * Lưu hợp đồng thuê mới vào CSDL, cập nhật phòng thành occupied và gửi Email thông báo
     */
    public function store(Request $request, Room $room)
    {
        $this->authorizeContractAction($room, 'create');
        
        $validated = $request->validate([
            'renter_request_id' => 'required|exists:renter_requests,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'terms' => 'nullable|string',
        ]);

        // Lấy RenterRequest data
        $renterRequest = RenterRequest::find($validated['renter_request_id']);
        
        // Cập nhật trạng thái RenterRequest thành 'approved'
        $renterRequest->update(['status' => 'approved']);
        
        $validated['status'] = 'active';
        
        $contract = $room->contracts()->create($validated);

        // Cập nhật trạng thái phòng thành "occupied"
        $room->update(['status' => 'occupied']);

        // === TỰ ĐỘNG TẠO METER LOG KHỞI ĐIỂM CHO NGƯỜI THUÊ MỚI ===
        // Lấy chỉ số điện nước cuối cùng của phòng làm mốc bắt đầu
        $latestMeterLog = MeterLog::where('room_id', $room->id)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->first();
        if ($latestMeterLog) {
            $nowMonth = now()->month;
            $nowYear  = now()->year;
            // Chỉ tạo nếu chưa có bản ghi cho tháng hiện tại
            $alreadyExists = MeterLog::where('room_id', $room->id)
                ->where('month', $nowMonth)
                ->where('year',  $nowYear)
                ->exists();
            if (!$alreadyExists) {
                MeterLog::create([
                    'room_id'          => $room->id,
                    'month'            => $nowMonth,
                    'year'             => $nowYear,
                    'electric_reading' => $latestMeterLog->electric_reading,
                    'water_reading'    => $latestMeterLog->water_reading,
                    'electric_usage'   => 0,
                    'water_usage'      => 0,
                    'notes'            => 'Chỉ số khởi điểm tự động — bắt đầu hợp đồng mới',
                ]);
            }
        }

        // Load relationship before redirect
        $contract->load(['renterRequest', 'room.house.user']);

        // === TỰ ĐỘNG TẠO HOẶC KÍCH HOẠT TÀI KHOẢN ĐĂNG NHẬP CHO KHÁCH THUÊ ===
        $tenantUser = \App\Models\User::where('renter_request_id', $renterRequest->id)->first();
        $plainPassword = $renterRequest->phone ?? '12345678';
        $accountEmail = null;

        if (!$tenantUser) {
            $email = $renterRequest->email;
            if (!$email || \App\Models\User::where('email', $email)->exists()) {
                $baseEmail = ($renterRequest->phone ?? rand(100000, 999999)) . '@tenant.local';
                $email = $baseEmail;
                $counter = 1;
                while (\App\Models\User::where('email', $email)->exists()) {
                    $email = ($renterRequest->phone ?? rand(100000, 999999)) . '.' . $counter . '@tenant.local';
                    $counter++;
                }
            }

            $tenantUser = \App\Models\User::create([
                'name' => $renterRequest->name,
                'email' => $email,
                'password' => bcrypt($plainPassword),
                'role' => 'tenant',
                'status' => 'active',
                'renter_request_id' => $renterRequest->id,
                'email_verified_at' => now(),
            ]);
            $accountEmail = $tenantUser->email;
        } else {
            $tenantUser->update(['status' => 'active']);
            $accountEmail = $tenantUser->email;
        }

        // Gửi email hợp đồng kèm thông tin tài khoản đăng nhập cho khách thuê
        $recipientEmail = !empty($renterRequest->email) ? $renterRequest->email : (!str_contains($accountEmail, '@tenant.local') ? $accountEmail : null);

        if ($recipientEmail) {
            try {
                Mail::to($recipientEmail)->send(new ContractCreatedMail($contract, $accountEmail, $plainPassword));
            } catch (\Exception $e) {
                // Log lỗi để tránh làm nghẽn quá trình tạo hợp đồng nếu SMTP chưa được cấu hình
                \Log::error('Lỗi gửi email hợp đồng: ' . $e->getMessage());
            }
        }

        // Tự động gửi Email thông báo lịch sự, chuyển trạng thái 'rejected' và lưu trữ (Soft Delete) các yêu cầu còn lại của phòng này
        $otherRequests = RenterRequest::where('room_id', $room->id)
            ->where('id', '!=', $renterRequest->id)
            ->whereIn('status', ['new', 'contacted'])
            ->get();

        foreach ($otherRequests as $other) {
            if ($other->email) {
                try {
                    Mail::to($other->email)->send(new \App\Mail\RoomAlreadyRentedMail($other, $room));
                } catch (\Exception $e) {
                    \Log::error('Lỗi gửi mail thông báo hết phòng: ' . $e->getMessage());
                }
            }
            $other->update(['status' => 'rejected']);
            $other->delete(); // Tự động lưu trữ (Soft Delete)
        }

        return redirect()->route('landlord.rooms.contracts.show', [
            'room' => $room->id,
            'contract' => $contract->id,
        ])->with('success', 'Tạo hợp đồng thành công! Đã gửi email cho khách thuê và tự động thông báo/lưu trữ các yêu cầu khác.');
    }

    /**
     * Xem thông tin chi tiết một hợp đồng thuê phòng
     */
    public function show(Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'view');
        
        $contract->load('renterRequest');
        
        $contractData = [
            'id' => $contract->id,
            'room_id' => $contract->room_id,
            'renter_request_id' => $contract->renter_request_id,
            'start_date' => $contract->start_date,
            'end_date' => $contract->end_date,
            'monthly_rent' => $contract->monthly_rent,
            'deposit' => $contract->deposit,
            'payment_date' => $contract->payment_date,
            'status' => $contract->status,
            'terms' => $contract->terms,
            'renterRequest' => $contract->renterRequest,
        ];
        
        return Inertia::render('Landlord/Contracts/Show', [
            'room' => $room->load('house'),
            'contract' => $contractData,
        ]);
    }

    /**
     * Hiển thị trang chỉnh sửa hợp đồng thuê phòng
     */
    public function edit(Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'edit');
        
        $renterRequests = RenterRequest::select(['id', 'name', 'phone', 'email'])
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        return Inertia::render('Landlord/Contracts/Edit', [
            'room' => $room->load('house'),
            'contract' => $contract->load('renterRequest'),
            'renterRequests' => $renterRequests,
        ]);
    }

    /**
     * Cập nhật thông tin hợp đồng hoặc chấm dứt hợp đồng sớm (kèm bật/tắt tài khoản tenant)
     */
    public function update(Request $request, Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'edit');
        
        // Nếu chỉ cập nhật status (chấm dứt)
        if ($request->has('status') && !$request->has('renter_request_id')) {
            $validated = $request->validate([
                'status' => 'required|in:active,terminated,expired',
            ]);

            $contract->update($validated);

            // Cập nhật trạng thái phòng dựa trên status hợp đồng
            if ($validated['status'] === 'active') {
                $room->update(['status' => 'occupied']);
                // Kích hoạt lại tài khoản tenant nếu có
                if ($contract->renter_request_id) {
                    \App\Models\User::where('renter_request_id', $contract->renter_request_id)
                        ->where('role', 'tenant')
                        ->update(['status' => 'active']);
                }
            } else {
                $room->update(['status' => 'available']);
                // Vô hiệu hóa tài khoản tenant khi hết thuê
                if ($contract->renter_request_id) {
                    \App\Models\User::where('renter_request_id', $contract->renter_request_id)
                        ->where('role', 'tenant')
                        ->update(['status' => 'inactive']);
                }
            }

            return redirect()->route('landlord.rooms.contracts.show', [
                'room' => $room->id,
                'contract' => $contract->id,
            ])->with('success', 'Cập nhật hợp đồng thành công!');
        }

        // Cập nhật toàn bộ thông tin hợp đồng
        $validated = $request->validate([
            'renter_request_id' => 'required|exists:renter_requests,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'status' => 'required|in:active,terminated,expired',
            'terms' => 'nullable|string',
        ]);

        $contract->update($validated);

        // Cập nhật trạng thái phòng và tài khoản dựa trên status hợp đồng
        if ($validated['status'] === 'active') {
            $room->update(['status' => 'occupied']);
            if ($validated['renter_request_id']) {
                \App\Models\User::where('renter_request_id', $validated['renter_request_id'])
                    ->where('role', 'tenant')
                    ->update(['status' => 'active']);
            }
        } else {
            $room->update(['status' => 'available']);
            if ($validated['renter_request_id']) {
                \App\Models\User::where('renter_request_id', $validated['renter_request_id'])
                    ->where('role', 'tenant')
                    ->update(['status' => 'inactive']);
            }
        }

        return redirect()->route('landlord.rooms.contracts.show', [
            'room' => $room->id,
            'contract' => $contract->id,
        ])->with('success', 'Cập nhật hợp đồng thành công!');
    }

    /**
     * Gia hạn hợp đồng thuê (theo số tháng hoặc theo ngày kết thúc cụ thể)
     */
    public function renew(Request $request, Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'edit');

        $validated = $request->validate([
            'months'       => 'nullable|integer|min:1|max:120',
            'new_end_date' => 'nullable|date',
        ]);

        // Phải có ít nhất một trong hai
        if (empty($validated['months']) && empty($validated['new_end_date'])) {
            return back()->withErrors(['new_end_date' => 'Vui lòng chọn số tháng gia hạn hoặc nhập ngày kết thúc mới.']);
        }

        // Tính ngày kết thúc mới: nếu nhập tháng thì cộng từ ngày hiện tại của hợp đồng
        if (!empty($validated['months'])) {
            $baseDate = $contract->end_date && $contract->end_date->isFuture()
                ? $contract->end_date
                : now();
            $newEndDate = $baseDate->addMonths((int) $validated['months']);
        } else {
            $newEndDate = \Carbon\Carbon::parse($validated['new_end_date']);
        }

        if ($newEndDate->lte(now())) {
            return back()->withErrors(['new_end_date' => 'Ngày gia hạn phải sau ngày hôm nay.']);
        }

        $contract->update([
            'end_date' => $newEndDate,
            'status'   => 'active',
        ]);

        // Đảm bảo phòng chuyển về occupied
        $room->update(['status' => 'occupied']);

        return redirect()->route('landlord.rooms.contracts.show', [
            'room'     => $room->id,
            'contract' => $contract->id,
        ])->with('success', "Gia hạn hợp đồng thành công! Hợp đồng có hiệu lực đến ngày {$newEndDate->format('d/m/Y')}.");
    }

    /**
     * Xóa hợp đồng thuê phòng (tự động giải phóng phòng về available nếu không còn hợp đồng active)
     */
    public function destroy(Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'delete');
        
        $renterRequestId = $contract->renter_request_id;
        
        $contract->delete();
        
        // Kiểm tra nếu không còn hợp đồng active nào, cập nhật trạng thái phòng
        if (!$room->contracts()->where('status', 'active')->exists()) {
            $room->update(['status' => 'available']);
        }

        // Xóa tài khoản tenant nếu không còn hợp đồng nào
        if ($renterRequestId) {
            $hasOtherContracts = \App\Models\Contract::where('renter_request_id', $renterRequestId)
                ->where(function ($query) {
                    $query->where('end_date', '>=', now())
                          ->orWhereNull('end_date');
                })
                ->exists();
            
            // Nếu không còn hợp đồng active, xóa tài khoản tenant
            if (!$hasOtherContracts) {
                \App\Models\User::where('renter_request_id', $renterRequestId)
                    ->where('role', 'tenant')
                    ->delete();
            }
        }

        return redirect()->route('landlord.rooms.contracts.index', $room->id)
            ->with('success', 'Đã xóa hợp đồng');
    }

    /**
     * Xuất hợp đồng ra file PDF
     */
    public function downloadPdf(Room $room, Contract $contract)
    {
        $this->authorizeContractAction($room, 'view');

        $contract->load('renterRequest.services');
        $room->load(['house.user', 'services']);

        $landlord = $room->house->user;
        $renter   = $contract->renterRequest;

        $pdf = Pdf::loadView('landlord.contracts.pdf', compact('contract', 'room', 'landlord', 'renter'))
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont'  => 'DejaVu Sans',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'chroot' => public_path(),
            ]);

        $filename = 'HopDong_' . str_pad($contract->id, 4, '0', STR_PAD_LEFT)
            . '_Phong' . str_replace(' ', '', $room->name)
            . '_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Xuất hợp đồng ra file PDF dành riêng cho Tenant
     */
    public function downloadPdfTenant(Contract $contract)
    {
        $user = auth()->user();
        if ($user->role === 'tenant' && $user->renter_request_id !== $contract->renter_request_id) {
            abort(403, 'Bạn không có quyền xem hoặc tải hợp đồng này.');
        }

        $contract->load(['room.house.user', 'room.services', 'renterRequest.services']);
        $room = $contract->room;
        $landlord = $room->house->user;
        $renter   = $contract->renterRequest;

        $pdf = Pdf::loadView('landlord.contracts.pdf', compact('contract', 'room', 'landlord', 'renter'))
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont'  => 'DejaVu Sans',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'chroot' => public_path(),
            ]);

        $filename = 'HopDong_Phong' . str_replace(' ', '', $room->name) . '_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }
}