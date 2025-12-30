<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RevenueController extends Controller
{
    /**
     * Báo cáo thu nhập theo tháng
     */
    public function monthlyReport(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // Lấy tất cả bills của tháng này
        $bills = Bill::with(['room', 'renterRequest'])
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        // Tính toán
        $totalBillAmount = $bills->sum('amount');
        $totalPaidAmount = $bills->sum('paid_amount');
        $totalUnpaidAmount = $totalBillAmount - $totalPaidAmount;
        $billCount = $bills->count();

        // Chi tiết theo phòng
        $byRoom = $bills->groupBy('room_id')->map(function ($roomBills) {
            return [
                'room' => $roomBills->first()->room,
                'total_amount' => $roomBills->sum('amount'),
                'total_paid' => $roomBills->sum('paid_amount'),
                'total_unpaid' => $roomBills->sum('amount') - $roomBills->sum('paid_amount'),
                'bills' => $roomBills,
            ];
        });

        return Inertia::render('Landlord/Reports/MonthlyRevenue', [
            'month' => $month,
            'year' => $year,
            'totalBillAmount' => $totalBillAmount,
            'totalPaidAmount' => $totalPaidAmount,
            'totalUnpaidAmount' => $totalUnpaidAmount,
            'billCount' => $billCount,
            'paidPercentage' => $totalBillAmount > 0 ? ($totalPaidAmount / $totalBillAmount) * 100 : 0,
            'byRoom' => $byRoom->values(),
            'bills' => $bills,
        ]);
    }

    /**
     * Báo cáo thu nhập năm-to-date
     */
    public function yearToDateReport(Request $request)
    {
        $year = $request->input('year', now()->year);

        // Lấy tất cả bills của năm này
        $bills = Bill::with(['room', 'renterRequest'])
            ->where('year', $year)
            ->get();

        // Tính toán theo tháng
        $yearData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthBills = $bills->where('month', $month);
            $totalBilled = $monthBills->sum('amount');
            $totalPaid = $monthBills->sum('paid_amount');
            
            $yearData[] = [
                'month' => $month,
                'month_name' => $this->getMonthName($month),
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalBilled - $totalPaid,
                'bill_count' => $monthBills->count(),
            ];
        }

        $totalBillAmount = $bills->sum('amount');
        $totalPaidAmount = $bills->sum('paid_amount');
        $totalUnpaidAmount = $totalBillAmount - $totalPaidAmount;

        return Inertia::render('Landlord/Reports/YearToDateRevenue', [
            'year' => $year,
            'totalBillAmount' => $totalBillAmount,
            'totalPaidAmount' => $totalPaidAmount,
            'totalUnpaidAmount' => $totalUnpaidAmount,
            'paidPercentage' => $totalBillAmount > 0 ? ($totalPaidAmount / $totalBillAmount) * 100 : 0,
            'yearData' => $yearData,
        ]);
    }

    /**
     * Báo cáo chi tiết thanh toán
     */
    public function paymentHistory(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = Payment::with(['bill.room', 'bill.contract.renterRequest'])
            ->latest('payment_date');

        if ($fromDate) {
            $query->where('payment_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('payment_date', '<=', $toDate);
        }

        $payments = $query->get();

        $totalAmount = $payments->sum('amount');
        
        // Group by payment method
        $byMethod = [];
        $methods = ['cash', 'bank_transfer', 'check', 'other'];
        
        foreach ($methods as $method) {
            $methodPayments = $payments->where('payment_method', $method);
            if ($methodPayments->count() > 0) {
                $byMethod[$method] = [
                    'count' => $methodPayments->count(),
                    'total' => $methodPayments->sum('amount'),
                ];
            }
        }

        return Inertia::render('Landlord/Reports/PaymentHistory', [
            'payments' => $payments,
            'totalAmount' => $totalAmount,
            'byMethod' => $byMethod,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
        ]);
    }

    private function getMonthName($month)
    {
        $months = [
            1 => 'Tháng 1',
            2 => 'Tháng 2',
            3 => 'Tháng 3',
            4 => 'Tháng 4',
            5 => 'Tháng 5',
            6 => 'Tháng 6',
            7 => 'Tháng 7',
            8 => 'Tháng 8',
            9 => 'Tháng 9',
            10 => 'Tháng 10',
            11 => 'Tháng 11',
            12 => 'Tháng 12',
        ];
        return $months[$month] ?? '';
    }
}
