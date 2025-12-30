<?php

// Test script để kiểm tra hệ thống nhắc nhở

use App\Models\Contract;
use App\Models\Bill;
use App\Models\Reminder;
use Carbon\Carbon;

echo "=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===\n\n";

// 1. Contracts active
$activeContracts = Contract::where('status', 'active')->with('room')->get();
echo "✓ Số hợp đồng active: " . $activeContracts->count() . "\n";
foreach ($activeContracts as $contract) {
    echo "  - Phòng: {$contract->room->name}\n";
}
echo "\n";

// 2. Bills tháng này
$thisMonthBills = Bill::where('month', date('n'))
    ->where('year', date('Y'))
    ->with('contract.room')
    ->get();
echo "✓ Hóa đơn tháng này (" . date('m/Y') . "): " . $thisMonthBills->count() . "\n";
foreach ($thisMonthBills as $bill) {
    echo "  - {$bill->contract->room->name}: " . number_format($bill->amount) . " VNĐ - Status: {$bill->status}\n";
}
echo "\n";

// 3. Bills chưa thanh toán
$unpaidBills = Bill::whereIn('status', ['pending', 'partial'])
    ->with('contract.room')
    ->get();
echo "✓ Hóa đơn chưa thanh toán: " . $unpaidBills->count() . "\n";
foreach ($unpaidBills as $bill) {
    $daysLeft = Carbon::parse($bill->due_date)->diffInDays(Carbon::today(), false);
    $status = $daysLeft < 0 ? "Còn " . abs($daysLeft) . " ngày" : ($daysLeft == 0 ? "HÔM NAY" : "QUÁ HẠN " . $daysLeft . " ngày");
    echo "  - {$bill->contract->room->name} (T{$bill->month}/{$bill->year}): " . 
         number_format($bill->amount - $bill->paid_amount) . " VNĐ - $status\n";
}
echo "\n";

// 4. Reminders hiện có
$reminders = Reminder::with('contract.room')->get();
echo "✓ Tổng số nhắc nhở: " . $reminders->count() . "\n";
$groupedReminders = $reminders->groupBy('type');
foreach ($groupedReminders as $type => $items) {
    $typeLabels = [
        'payment' => 'Thanh toán',
        'contract_expiry' => 'Hết hạn HĐ',
        'bill_creation' => 'Tạo hóa đơn',
        'bill_payment' => 'Thanh toán hóa đơn',
    ];
    echo "  - {$typeLabels[$type]}: {$items->count()} nhắc nhở\n";
}
echo "\n";

echo "=== PHÂN TÍCH ===\n\n";

// Kiểm tra xem cần tạo reminder gì
foreach ($activeContracts as $contract) {
    $hasBillThisMonth = Bill::where('contract_id', $contract->id)
        ->where('month', date('n'))
        ->where('year', date('Y'))
        ->exists();
    
    if (!$hasBillThisMonth) {
        echo "⚠️  Phòng {$contract->room->name} chưa có hóa đơn tháng này\n";
        echo "   → Sẽ tạo reminder 'bill_creation'\n\n";
    }
}

foreach ($unpaidBills as $bill) {
    $dueDate = Carbon::parse($bill->due_date);
    $daysLeft = $dueDate->diffInDays(Carbon::today(), false);
    
    if ($daysLeft >= -3 && $daysLeft <= 0) {
        echo "⚠️  Hóa đơn {$bill->contract->room->name} sắp đến hạn\n";
        echo "   Hạn: {$dueDate->format('d/m/Y')} (còn " . abs($daysLeft) . " ngày)\n";
        echo "   → Sẽ tạo reminder 'bill_payment'\n\n";
    } elseif ($daysLeft > 0) {
        echo "🚨 Hóa đơn {$bill->contract->room->name} ĐÃ QUÁ HẠN {$daysLeft} ngày\n";
        echo "   → Sẽ tạo reminder 'bill_payment' khẩn cấp\n\n";
    }
}

echo "\n=== CHẠY COMMAND TẠO NHẮC NHỞ ===\n\n";
echo "Chạy: php artisan reminders:generate\n";
