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

        $bill->load(['room', 'payments.verifiedByUser']);

        return Inertia::render('Tenant/Bills/Show', [
            'bill' => $bill,
        ]);
    }
}
