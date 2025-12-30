<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic reminder generation
Schedule::command('reminders:generate')
    ->daily()
    ->at('08:00') // Thay đổi giờ ở đây: '06:00', '12:00', '18:00', v.v.
    ->description('Tự động tạo nhắc nhở thanh toán và hết hạn hợp đồng');

