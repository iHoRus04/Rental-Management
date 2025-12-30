<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Contract;
use Carbon\Carbon;

echo "=== KIỂM TRA HỢP ĐỒNG SẮP HẾT HẠN ===\n\n";

$today = Carbon::today();
$in30Days = $today->copy()->addDays(30);

$contracts = Contract::where('status', 'active')
    ->whereBetween('end_date', [$today, $in30Days])
    ->with('room')
    ->get();

echo "Hợp đồng sắp hết hạn trong 30 ngày: " . $contracts->count() . "\n\n";

foreach ($contracts as $contract) {
    $endDate = Carbon::parse($contract->end_date);
    $daysLeft = $today->diffInDays($endDate);
    
    echo "Phòng: {$contract->room->name}\n";
    echo "Hết hạn: {$endDate->format('d/m/Y')}\n";
    echo "Còn: {$daysLeft} ngày\n";
    echo "---\n";
}

// Chạy generate
echo "\n=== CHẠY GENERATE REMINDERS ===\n\n";
Artisan::call('reminders:generate');
echo Artisan::output();

// Kiểm tra reminders vừa tạo
echo "\n=== REMINDERS ĐÃ TẠO ===\n\n";
$reminders = \App\Models\Reminder::where('type', 'contract_expiry')
    ->where('is_sent', false)
    ->with('contract.room')
    ->get();

echo "Tổng: " . $reminders->count() . "\n\n";
foreach ($reminders as $reminder) {
    echo "- {$reminder->contract->room->name}: {$reminder->message}\n";
}
