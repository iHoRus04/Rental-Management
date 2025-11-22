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
                'renter_id' => $contract->renter_id,
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
                'due_date' => Carbon::create($year, $month, 1)->addMonth()->toDateString(),
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
