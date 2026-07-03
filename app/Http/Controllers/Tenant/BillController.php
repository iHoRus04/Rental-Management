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

        // Tạo bản ghi Payment giả lập để lưu lại lịch sử thanh toán
        \App\Models\Payment::create([
            'bill_id' => $bill->id,
            'amount' => $remaining,
            'payment_date' => now(),
            'payment_method' => 'bank_transfer',
            'reference' => 'Thanh toán giả lập (Tenant Test)',
            'notes' => 'Thực hiện thanh toán trực tiếp qua chức năng TEST từ Tenant Portal.',
            'bank_transaction_code' => 'TESTPAY' . time(),
            'verified_by' => null,
        ]);

        // Cập nhật paid_amount và trạng thái
        $bill->paid_amount = $bill->amount;
        $bill->status = 'paid';
        $bill->save();

        return redirect()->back()->with('success', 'Thanh toán giả lập hóa đơn thành công!');
    }
}
