<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Contract;
use Carbon\Carbon;

class BillService
{
    /**
     * Tạo hóa đơn tự động cho tất cả hợp đồng còn hoạt động
     */
    public function generateMonthlyBills($month = null, $year = null)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        // Lấy tất cả hợp đồng đang hoạt động
        $contracts = Contract::where('status', 'active')
            ->where('start_date', '<=', Carbon::create($year, $month, 1)->endOfMonth())
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', Carbon::now()->startOfMonth());
            })
            ->get();

        $billsCreated = 0;

        foreach ($contracts as $contract) {
            // Kiểm tra xem hóa đơn đã tồn tại chưa
            $existingBill = Bill::where('contract_id', $contract->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if ($existingBill) {
                continue;
            }

            // Tạo hóa đơn mới
            $bill = new Bill([
                'contract_id' => $contract->id,
                'room_id' => $contract->room_id,
                'renter_request_id' => $contract->renter_request_id,
                'month' => $month,
                'year' => $year,
                'room_price' => $contract->monthly_rent,
                'electric_kwh' => 0,
                'electric_cost' => 0,
                'water_cost' => 0,
                'internet_cost' => 0,
                'trash_cost' => 0,
                'other_costs' => 0,
                'status' => 'pending',
                'paid_amount' => 0,
                // Calculate due_date based on contract start_date + payment_date (days)
                // If contract->payment_date is not set, fall back to first day of next month
                'due_date' => $this->calculateDueDate($contract, $year, $month),
                'paid_date' => null,
            ]);

            $bill->calculateTotal();
            $bill->save();

            $billsCreated++;
        }

        return $billsCreated;
    }

    /**
     * Cập nhật status các hóa đơn quá hạn
     */
    public function updateOverdueBills()
    {
        Bill::where('status', 'pending')
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);

        // Cập nhật status sang quá hạn nếu thanh toán một phần
        Bill::where('status', 'partial')
            ->where('due_date', '<', now()->toDateString())
            ->each(function ($bill) {
                // Giữ status partial nếu đã thanh toán một phần, nhưng có thể thêm cột is_overdue
            });
    }

    /**
     * Cập nhật tiền điện, nước, internet cho hóa đơn
     */
    public function updateBillCosts(Bill $bill, array $data)
    {
        if (isset($data['electric_kwh'])) {
            $bill->electric_kwh = $data['electric_kwh'];
            // Giá điện mặc định 3000 VND/kWh, có thể cấu hình sau
            $bill->electric_cost = $data['electric_kwh'] * 3000;
        }

        if (isset($data['water_cost'])) {
            $bill->water_cost = $data['water_cost'];
        }

        if (isset($data['internet_cost'])) {
            $bill->internet_cost = $data['internet_cost'];
        }

        if (isset($data['trash_cost'])) {
            $bill->trash_cost = $data['trash_cost'];
        }

        if (isset($data['other_costs'])) {
            $bill->other_costs = $data['other_costs'];
        }

        $bill->calculateTotal();
        $bill->save();

        return $bill;
    }

    /**
     * Calculate due date for a bill based on contract start_date + payment_date (days offset)
     */
    private function calculateDueDate(Contract $contract, $year, $month)
    {
        // If payment_date is set (interpreted as days offset from start_date)
        if ($contract->payment_date !== null) {
            try {
                $start = Carbon::parse($contract->start_date ?? Carbon::create($year, $month, 1));

                // payment_date is stored as integer; treat it as number of days to add
                $offsetDays = (int) $contract->payment_date;

                // Build a date in the target month/year using the start day, then add offset
                $base = Carbon::create($year, $month, min($start->day, Carbon::create($year, $month, 1)->endOfMonth()->day));
                $due = $base->copy()->addDays($offsetDays);

                // Clamp to end of month if overflow
                $endOfMonth = Carbon::create($year, $month, 1)->endOfMonth();
                if ($due->gt($endOfMonth)) {
                    $due = $endOfMonth;
                }

                return $due->toDateString();
            } catch (\Exception $e) {
                // If anything goes wrong, fall back to next month's first day
            }
        }

        // Default: first day of month + 1 month (same behavior as before)
        return Carbon::create($year, $month, 1)->addMonth()->toDateString();
    }

    /**
     * Ghi nhận thanh toán hóa đơn
     */
    public function recordPayment(Bill $bill, $amount)
    {
        $bill->paid_amount += $amount;
        $bill->updatePaymentStatus();
        $bill->save();

        return $bill;
    }
}
