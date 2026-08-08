<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Mail\SubscriptionExpiringMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendSubscriptionExpiryAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:expiry-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Quét và gửi email cảnh báo cho các chủ trọ có gói cước dịch vụ sắp hết hạn trong vòng 1, 2 hoặc 3 ngày';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Bắt đầu quét các gói cước sắp hết hạn...');
        Log::info('Bắt đầu quét các gói cước sắp hết hạn...');

        $activeSubscriptions = Subscription::where('status', 'active')
            ->where('end_date', '>', now())
            ->with(['user', 'package'])
            ->get();

        $sentCount = 0;

        foreach ($activeSubscriptions as $sub) {
            if (!$sub->user || empty($sub->user->email)) {
                continue;
            }

            $endDate = Carbon::parse($sub->end_date)->startOfDay();
            $diffInDays = (int) Carbon::today()->diffInDays($endDate, false);

            // Gửi email cảnh báo nếu còn đúng 1, 2 hoặc 3 ngày là hết hạn
            if ($diffInDays >= 1 && $diffInDays <= 3) {
                try {
                    Mail::to($sub->user->email)
                        ->send(new SubscriptionExpiringMail($sub, $diffInDays));
                    
                    $this->info("Đã gửi email cảnh báo hết hạn ({$diffInDays} ngày) cho chủ trọ: {$sub->user->name} ({$sub->user->email})");
                    Log::info("Đã gửi email cảnh báo hết hạn ({$diffInDays} ngày) cho chủ trọ: {$sub->user->name} ({$sub->user->email})");
                    $sentCount++;
                } catch (\Exception $e) {
                    $this->error("Lỗi khi gửi email cho {$sub->user->email}: " . $e->getMessage());
                    Log::error("Lỗi khi gửi email cảnh báo hết hạn cho {$sub->user->email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Hoàn tất quét. Đã gửi {$sentCount} email cảnh báo.");
        Log::info("Hoàn tất quét. Đã gửi {$sentCount} email cảnh báo.");
    }
}
