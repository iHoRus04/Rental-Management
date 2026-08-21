<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Contract;
use App\Models\MeterLog;
use App\Models\RoomService;
use Carbon\Carbon;

class BillService
{
    /**
     * Tạo hóa đơn tự động cho tất cả hợp đồng còn hoạt động
     * 
     * Quy trình:
     * 1. Lấy MeterLog → electric_usage, water_usage
     * 2. Lấy room_services (active) → đơn giá điện, nước, dịch vụ cố định
     * 3. Tính toán: amount = room_price + electric_cost + water_cost + other_costs
     * 4. Tạo price_snapshot JSON (đóng băng biểu giá)
     * 5. Tạo service_details JSON (breakdown chi tiết)
     */
    public function generateMonthlyBills($month = null, $year = null, $createdBy = null)
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $user = $createdBy ? \App\Models\User::find($createdBy) : null;
        $houseIds = $user ? $user->getAccessibleHouseIds() : [];

        // Lấy tất cả hợp đồng đang hoạt động thuộc các nhà trọ được quản lý
        $query = Contract::where('status', 'active')
            ->where('start_date', '<=', Carbon::create($year, $month, 1)->endOfMonth())
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', Carbon::now()->startOfMonth());
            });

        if ($user) {
            $query->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            });
        }

        $contracts = $query->with(['room.house', 'room.services' => function ($q) {
                $q->wherePivot('is_active', true);
            }])
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

            // === Bước 1: Lấy MeterLog của tháng ===
            $meterLog = MeterLog::where('room_id', $contract->room_id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            $electricUsage = $meterLog ? $meterLog->electric_usage : 0;
            $waterUsage = $meterLog ? $meterLog->water_usage : 0;

            // === Bước 2: Lấy room_services (active) & Cấu hình giá nhà trọ ===
            $roomServices = $contract->room->services ?? collect();
            $house = $contract->room->house ?? null;
            
            // RÀNG BUỘC NGHIÊM NGẶT: Nếu nhà trọ chưa thiết lập tài khoản ngân hàng VietQR -> Bỏ qua không cho tạo hóa đơn
            if (!$house || empty($house->bank_name) || empty($house->account_no) || empty($house->account_name)) {
                continue;
            }

            // Đơn giá mặc định lấy từ nhà trọ trước
            $electricPrice = floatval($house->electric_price ?? 0);
            $waterPrice = floatval($house->water_price ?? 0);
            $fixedServicesCost = 0;
            $serviceDetails = [];

            foreach ($roomServices as $service) {
                $pivotPrice = floatval($service->pivot->price ?? 0);
                $defaultPrice = floatval($service->default_price ?? 0);
                $price = $pivotPrice > 0 ? $pivotPrice : $defaultPrice;
                $unit = $service->unit;

                if ($unit === 'kwh') {
                    if ($pivotPrice > 0) {
                        $electricPrice = $pivotPrice;
                    }
                    $serviceDetails[] = [
                        'name' => $service->name,
                        'unit' => $unit,
                        'unit_price' => $electricPrice,
                        'quantity' => $electricUsage,
                        'total' => $electricUsage * $electricPrice,
                        'type' => 'electric',
                    ];
                } elseif ($unit === 'm3') {
                    if ($pivotPrice > 0) {
                        $waterPrice = $pivotPrice;
                    }
                    $serviceDetails[] = [
                        'name' => $service->name,
                        'unit' => $unit,
                        'unit_price' => $waterPrice,
                        'quantity' => $waterUsage,
                        'total' => $waterUsage * $waterPrice,
                        'type' => 'water',
                    ];
                } else {
                    // Dịch vụ cố định (internet, rác, ...) tính theo tháng
                    $fixedServicesCost += $price;
                    $serviceDetails[] = [
                        'name' => $service->name,
                        'unit' => $unit,
                        'unit_price' => $price,
                        'quantity' => 1,
                        'total' => $price,
                        'type' => 'fixed',
                    ];
                }
            }

            // === Bước 3: Tính toán chi phí ===
            $electricCost = $electricUsage * $electricPrice;
            $waterCost = $waterUsage * $waterPrice;

            // === Bước 4: Tạo Price Snapshot (đóng băng biểu giá) ===
            $priceSnapshot = [
                'room_price' => $contract->monthly_rent,
                'electric_unit_price' => $electricPrice,
                'water_unit_price' => $waterPrice,
                'services' => $roomServices->map(function ($s) use ($electricPrice, $waterPrice) {
                    $pivotPrice = floatval($s->pivot->price ?? 0);
                    $defaultPrice = floatval($s->default_price ?? 0);
                    $price = $pivotPrice > 0 ? $pivotPrice : $defaultPrice;
                    if ($s->unit === 'kwh') {
                        $price = $electricPrice;
                    } elseif ($s->unit === 'm3') {
                        $price = $waterPrice;
                    }
                    return [
                        'id' => $s->id,
                        'name' => $s->name,
                        'unit' => $s->unit,
                        'price' => $price,
                    ];
                })->values()->toArray(),
                'snapshot_at' => now()->toIso8601String(),
            ];

            // === Bước 5: Tạo hóa đơn ===
            $bill = new Bill([
                'contract_id' => $contract->id,
                'room_id' => $contract->room_id,
                'renter_request_id' => $contract->renter_request_id,
                'month' => $month,
                'year' => $year,
                'room_price' => $contract->monthly_rent,
                'electric_kwh' => $electricUsage,
                'electric_price' => $electricPrice,
                'electric_cost' => $electricCost,
                'water_usage' => $waterUsage,
                'water_price' => $waterPrice,
                'water_cost' => $waterCost,
                'service_costs' => $fixedServicesCost,
                'internet_cost' => 0,
                'trash_cost' => 0,
                'other_costs' => 0,
                'status' => 'pending',
                'paid_amount' => 0,
                'due_date' => $this->calculateDueDate($contract, $year, $month),
                'paid_date' => null,
                'price_snapshot' => $priceSnapshot,
                'service_details' => $serviceDetails,
                'created_by' => $createdBy,
            ]);

            $bill->calculateTotal();
            $bill->save();

            // Gửi email thông báo hóa đơn mới cho khách thuê (nếu có email)
            if ($bill->renterRequest && !empty($bill->renterRequest->email)) {
                try {
                    \Illuminate\Support\Facades\Mail::to($bill->renterRequest->email)
                        ->send(new \App\Mail\BillCreatedMail($bill));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Lỗi gửi mail thông báo hóa đơn hàng loạt: ' . $e->getMessage());
                }
            }

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
            $bill->electric_cost = $data['electric_kwh'] * ($bill->electric_price ?? 0);
        }

        if (isset($data['water_usage'])) {
            $bill->water_usage = $data['water_usage'];
            $bill->water_cost = $data['water_usage'] * ($bill->water_price ?? 0);
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
     * Tạo price snapshot cho hóa đơn đơn lẻ
     */
    public function createPriceSnapshot($roomId)
    {
        $roomServices = RoomService::where('room_id', $roomId)
            ->where('is_active', true)
            ->with('service')
            ->get();

        $snapshot = [
            'services' => $roomServices->map(function ($rs) {
                return [
                    'id' => $rs->service_id,
                    'name' => $rs->service->name,
                    'unit' => $rs->service->unit,
                    'price' => floatval($rs->price),
                ];
            })->values()->toArray(),
            'snapshot_at' => now()->toIso8601String(),
        ];

        return $snapshot;
    }

    /**
     * Tính toán ngày hết hạn thanh toán hóa đơn dựa trên trường payment_date của hợp đồng (ngày trong tháng)
     */
    private function calculateDueDate(Contract $contract, $year, $month)
    {
        if ($contract->payment_date !== null && $contract->payment_date > 0) {
            try {
                $day = (int) $contract->payment_date;
                $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                $targetDay = min($day, $daysInMonth);

                return Carbon::create($year, $month, $targetDay)->toDateString();
            } catch (\Exception $e) {
                // Nếu có lỗi, dùng mặc định ngày 10 hàng tháng
            }
        }

        // Mặc định: Ngày 10 của tháng đó
        return Carbon::create($year, $month, 10)->toDateString();
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
