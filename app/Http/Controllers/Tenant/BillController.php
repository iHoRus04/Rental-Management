<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Tenant BillController
 * 
 * Cho phép khách thuê xem hóa đơn của mình.
 * Hiển thị bảng kê chi tiết minh bạch từ price_snapshot.
 */
class BillController extends Controller
{
    /**
     * Danh sách hóa đơn của tenant
     */
    public function index()
    {
        $user = Auth::user();
        $renterRequestId = $user->renter_request_id;

        if (!$renterRequestId) {
            return Inertia::render('Tenant/Bills/Index', [
                'bills' => [],
            ]);
        }

        $bills = Bill::with(['room'])
            ->where('renter_request_id', $renterRequestId)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        return Inertia::render('Tenant/Bills/Index', [
            'bills' => $bills,
        ]);
    }

    /**
     * Chi tiết hóa đơn với breakdown minh bạch
     */
    public function show(Bill $bill)
    {
        $user = Auth::user();

        // Kiểm tra quyền: chỉ xem hóa đơn của mình
        if ($bill->renter_request_id !== $user->renter_request_id) {
            abort(403, 'Bạn không có quyền xem hóa đơn này.');
        }

        $bill->load(['room.house', 'payments.verifiedByUser']);

        return Inertia::render('Tenant/Bills/Show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Nút thanh toán giả lập để test
     */
    public function payTest(Bill $bill)
    {
        $user = Auth::user();

        // Kiểm tra quyền: chỉ thanh toán hóa đơn của mình
        if ($bill->renter_request_id !== $user->renter_request_id) {
            abort(403, 'Bạn không có quyền thanh toán hóa đơn này.');
        }

        if ($bill->status === 'paid') {
            return redirect()->back()->with('error', 'Hóa đơn này đã được thanh toán rồi.');
        }

        $remaining = $bill->amount - $bill->paid_amount;

        if ($remaining <= 0) {
            return redirect()->back()->with('error', 'Hóa đơn này đã được thanh toán đầy đủ.');
        }

        // Chuẩn hóa Nội dung chuyển khoản chuẩn VietQR
        $houseName = $bill->room && $bill->room->house ? $bill->room->house->name : '';
        $roomName = $bill->room ? $bill->room->name : '';
        $rawContent = "THANH TOAN HD THANG {$bill->month} NAM {$bill->year} {$houseName} PHONG {$roomName}";
        $transferContent = strtoupper(\Illuminate\Support\Str::slug($rawContent, ' '));

        // Tạo bản ghi Payment giả lập để lưu lại lịch sử thanh toán
        \App\Models\Payment::create([
            'bill_id' => $bill->id,
            'amount' => $remaining,
            'payment_date' => now(),
            'payment_method' => 'bank_transfer',
            'reference' => $transferContent,
            'notes' => $transferContent,
            'bank_transaction_code' => 'TESTPAY' . time(),
            'verified_by' => null,
        ]);

        // Cập nhật paid_amount và trạng thái
        $bill->paid_amount = $bill->amount;
        $bill->status = 'paid';
        $bill->save();

        // Tự động tạo Nhắc nhở/Thông báo cho Chủ trọ
        $roomName = $bill->room ? $bill->room->name : 'Phòng thuê';
        \App\Models\Reminder::create([
            'contract_id' => $bill->contract_id,
            'bill_id' => $bill->id,
            'type' => 'bill_payment',
            'reminder_date' => now(),
            'message' => "Khách thuê {$user->name} ({$roomName}) đã chuyển khoản thanh toán " . number_format($remaining, 0, ',', '.') . "đ cho Hóa đơn Tháng {$bill->month}/{$bill->year}.",
            'is_sent' => false,
        ]);

        // Tự động gửi Email Biên lai xác nhận thanh toán cho Khách thuê
        $recipientEmail = $user->email ?? ($bill->renterRequest ? $bill->renterRequest->email : null);
        if ($recipientEmail) {
            try {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)
                    ->send(new \App\Mail\BillPaidMail($bill));
            } catch (\Exception $e) {
                // Tránh gián đoạn giao dịch nếu cấu hình Mail chưa gửi được trong môi trường dev
            }
        }

        return redirect()->back()->with('success', 'Thanh toán giả lập hóa đơn thành công! Đã gửi thông báo cho Chủ trọ và gửi Email biên lai cho bạn.');
    }
}
