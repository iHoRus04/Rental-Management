<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Bill;
use Carbon\Carbon;

class SetupTestData extends Command
{
    protected $signature = 'reminders:setup-test';
    protected $description = 'Thiết lập dữ liệu test cho hệ thống nhắc nhở';

    public function handle()
    {
        $this->info('Đang thiết lập dữ liệu test...');
        $this->newLine();

        // Cập nhật hóa đơn chưa thanh toán
        $unpaidBills = Bill::whereIn('status', ['pending', 'partial'])->get();
        
        if ($unpaidBills->count() > 0) {
            foreach ($unpaidBills as $index => $bill) {
                $daysFromNow = [2, 5, -1, -3]; // Một số kịch bản khác nhau
                $days = $daysFromNow[$index % count($daysFromNow)];
                
                $newDueDate = Carbon::today()->addDays($days);
                $bill->update(['due_date' => $newDueDate]);
                
                $status = $days > 0 ? "Còn $days ngày" : ($days == 0 ? "Hôm nay" : "Quá hạn " . abs($days) . " ngày");
                $this->line("✓ Cập nhật hóa đơn #{$bill->id} - Hạn: {$newDueDate->format('d/m/Y')} ($status)");
            }
        } else {
            $this->warn('Không có hóa đơn chưa thanh toán để test');
        }

        $this->newLine();
        $this->info('✓ Hoàn tất! Giờ bạn có thể:');
        $this->line('1. php artisan reminders:test (xem tình trạng)');
        $this->line('2. php artisan reminders:generate (tạo nhắc nhở)');
        $this->line('3. Truy cập: http://127.0.0.1:8000/landlord/reminders');

        return 0;
    }
}
