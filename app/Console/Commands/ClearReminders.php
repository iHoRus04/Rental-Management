<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reminder;

class ClearReminders extends Command
{
    protected $signature = 'reminders:clear';
    protected $description = 'Xóa tất cả nhắc nhở để test lại';

    public function handle()
    {
        $count = Reminder::count();
        
        if ($this->confirm("Bạn có chắc muốn xóa {$count} nhắc nhở?", true)) {
            Reminder::query()->delete();
            $this->info("✓ Đã xóa {$count} nhắc nhở");
            $this->line('Bây giờ chạy: php artisan reminders:generate');
        } else {
            $this->info('Đã hủy');
        }

        return 0;
    }
}
