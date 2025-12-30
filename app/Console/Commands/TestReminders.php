<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contract;
use App\Models\Bill;
use App\Models\Reminder;
use Carbon\Carbon;

class TestReminders extends Command
{
    protected $signature = 'reminders:test';
    protected $description = 'Test và hiển thị thông tin về hệ thống nhắc nhở';

    public function handle()
    {
        $this->info('=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===');
        $this->newLine();

        // 1. Contracts active
        $activeContracts = Contract::where('status', 'active')->with('room')->get();
        $this->info("✓ Số hợp đồng active: " . $activeContracts->count());
        foreach ($activeContracts as $contract) {
            $this->line("  - Phòng: {$contract->room->name}");
        }
        $this->newLine();

        // 2. Bills tháng này
        $currentMonth = Carbon::today()->month;
        $currentYear = Carbon::today()->year;
        $thisMonthBills = Bill::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->with('contract.room')
            ->get();
        $this->info("✓ Hóa đơn tháng này ({$currentMonth}/{$currentYear}): " . $thisMonthBills->count());
        foreach ($thisMonthBills as $bill) {
            $this->line("  - {$bill->contract->room->name}: " . number_format($bill->amount, 0, ',', '.') . " VNĐ - Status: {$bill->status}");
        }
        $this->newLine();

        // 3. Bills chưa thanh toán
        $unpaidBills = Bill::whereIn('status', ['pending', 'partial'])
            ->with('contract.room')
            ->get();
        $this->info("✓ Hóa đơn chưa thanh toán: " . $unpaidBills->count());
        foreach ($unpaidBills as $bill) {
            $dueDate = Carbon::parse($bill->due_date);
            $daysLeft = $dueDate->diffInDays(Carbon::today(), false);
            $status = $daysLeft < 0 ? "Còn " . abs($daysLeft) . " ngày" : ($daysLeft == 0 ? "HÔM NAY" : "QUÁ HẠN " . $daysLeft . " ngày");
            $remaining = $bill->amount - $bill->paid_amount;
            $this->line("  - {$bill->contract->room->name} (T{$bill->month}/{$bill->year}): " . 
                       number_format($remaining, 0, ',', '.') . " VNĐ - {$status} (hạn: {$dueDate->format('d/m/Y')})");
        }
        $this->newLine();

        // 4. Reminders hiện có
        $reminders = Reminder::with('contract.room')->orderBy('reminder_date')->get();
        $this->info("✓ Tổng số nhắc nhở: " . $reminders->count());
        $groupedReminders = $reminders->groupBy('type');
        foreach ($groupedReminders as $type => $items) {
            $typeLabels = [
                'payment' => '💰 Thanh toán',
                'contract_expiry' => '📋 Hết hạn HĐ',
                'bill_creation' => '📝 Tạo hóa đơn',
                'bill_payment' => '💸 Thanh toán hóa đơn',
            ];
            $label = $typeLabels[$type] ?? $type;
            $this->line("  {$label}: {$items->count()} nhắc nhở");
            foreach ($items as $reminder) {
                $status = $reminder->is_sent ? '✓ Đã gửi' : '⏳ Chờ gửi';
                $this->line("    - {$reminder->contract->room->name} ({$reminder->reminder_date->format('d/m/Y')}) {$status}");
            }
        }
        $this->newLine();

        // Phân tích
        $this->warn('=== PHÂN TÍCH ===');
        $this->newLine();

        $needsBillCreation = 0;
        $needsBillPayment = 0;

        // Kiểm tra phòng cần tạo hóa đơn
        foreach ($activeContracts as $contract) {
            $hasBillThisMonth = Bill::where('contract_id', $contract->id)
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->exists();
            
            if (!$hasBillThisMonth) {
                $this->warn("⚠️  Phòng {$contract->room->name} chưa có hóa đơn tháng này");
                $this->line("   → Sẽ tạo reminder 'bill_creation'");
                $needsBillCreation++;
            }
        }

        // Kiểm tra hóa đơn cần nhắc thanh toán
        foreach ($unpaidBills as $bill) {
            $dueDate = Carbon::parse($bill->due_date);
            $today = Carbon::today();
            $daysLeft = $dueDate->diffInDays($today, false);
            
            // Nhắc nếu còn 3 ngày hoặc đã quá hạn
            if ($daysLeft >= -3) {
                if ($daysLeft > 0) {
                    $this->error("🚨 Hóa đơn {$bill->contract->room->name} ĐÃ QUÁ HẠN {$daysLeft} ngày!");
                } elseif ($daysLeft == 0) {
                    $this->warn("⏰ Hóa đơn {$bill->contract->room->name} HÔM NAY LÀ HẠN CHÓT!");
                } else {
                    $this->warn("⚠️  Hóa đơn {$bill->contract->room->name} sắp đến hạn (còn " . abs($daysLeft) . " ngày)");
                }
                $this->line("   Hạn: {$dueDate->format('d/m/Y')}");
                $this->line("   → Sẽ tạo reminder 'bill_payment'");
                $needsBillPayment++;
            }
        }

        if ($needsBillCreation == 0 && $needsBillPayment == 0) {
            $this->info("✓ Không có nhắc nhở nào cần tạo");
        }

        $this->newLine();
        $this->info('=== HƯỚNG DẪN TEST ===');
        $this->newLine();
        $this->line('1. Chạy: php artisan reminders:generate');
        $this->line('2. Kiểm tra lại: php artisan reminders:test');
        $this->line('3. Xem trên web: http://127.0.0.1:8000/landlord/reminders');
        $this->line('4. Xóa tất cả reminders: php artisan tinker --execute="\\App\\Models\\Reminder::truncate();"');
        
        return 0;
    }
}
