<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contract;
use App\Models\Reminder;
use Carbon\Carbon;

class GenerateReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động tạo nhắc nhở thanh toán và hết hạn hợp đồng';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Bắt đầu tạo nhắc nhở tự động...');

        $paymentReminders = $this->generatePaymentReminders();
        $expiryReminders = $this->generateContractExpiryReminders();

        $this->info("✓ Đã tạo {$paymentReminders} nhắc nhở thanh toán");
        $this->info("✓ Đã tạo {$expiryReminders} nhắc nhở hết hạn hợp đồng");
        $this->info('Hoàn tất!');

        return 0;
    }

    /**
     * Generate payment reminders for active contracts
     */
    private function generatePaymentReminders()
    {
        $count = 0;
        $today = Carbon::today();
        $nextMonth = Carbon::today()->addMonth();

        // Get all active contracts
        $contracts = Contract::where('status', 'active')->get();

        foreach ($contracts as $contract) {
            // Calculate next payment date based on payment_date field (day of month)
            $nextPaymentDate = Carbon::create(
                $nextMonth->year,
                $nextMonth->month,
                $contract->payment_date
            );

            // Reminder date: 5 days before payment date
            $reminderDate = $nextPaymentDate->copy()->subDays(5);

            // Only create if reminder date is in the future
            if ($reminderDate->gte($today)) {
                // Check if reminder already exists
                $exists = Reminder::where('contract_id', $contract->id)
                    ->where('type', 'payment')
                    ->where('reminder_date', $reminderDate)
                    ->exists();

                if (!$exists) {
                    Reminder::create([
                        'contract_id' => $contract->id,
                        'type' => 'payment',
                        'reminder_date' => $reminderDate,
                        'message' => "Nhắc nhở thanh toán tiền thuê phòng tháng {$nextMonth->format('m/Y')}. " .
                                    "Số tiền: " . number_format($contract->monthly_rent, 0, ',', '.') . " ₫. " .
                                    "Ngày thanh toán: {$nextPaymentDate->format('d/m/Y')}",
                        'is_sent' => false,
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Generate contract expiry reminders
     */
    private function generateContractExpiryReminders()
    {
        $count = 0;
        $today = Carbon::today();
        $in30Days = Carbon::today()->addDays(30);

        // Get contracts expiring in the next 30 days
        $contracts = Contract::where('status', 'active')
            ->whereBetween('end_date', [$today, $in30Days])
            ->get();

        foreach ($contracts as $contract) {
            $endDate = Carbon::parse($contract->end_date);
            
            // Reminder date: 30 days before expiry
            $reminderDate = $endDate->copy()->subDays(30);

            // Only create if reminder date is today or in the future
            if ($reminderDate->gte($today)) {
                // Check if reminder already exists
                $exists = Reminder::where('contract_id', $contract->id)
                    ->where('type', 'contract_expiry')
                    ->where('reminder_date', $reminderDate)
                    ->exists();

                if (!$exists) {
                    $daysUntilExpiry = $today->diffInDays($endDate);
                    
                    Reminder::create([
                        'contract_id' => $contract->id,
                        'type' => 'contract_expiry',
                        'reminder_date' => $reminderDate,
                        'message' => "Hợp đồng sẽ hết hạn vào ngày {$endDate->format('d/m/Y')} " .
                                    "(còn {$daysUntilExpiry} ngày). " .
                                    "Vui lòng liên hệ người thuê để gia hạn hoặc chấm dứt hợp đồng.",
                        'is_sent' => false,
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }
}
