<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contract;
use App\Models\Reminder;
use App\Models\Bill;
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

        $billCreationReminders = $this->generateBillCreationReminders();
        $billPaymentReminders = $this->generateBillPaymentReminders();
        $paymentReminders = $this->generatePaymentReminders();
        $expiryReminders = $this->generateContractExpiryReminders();

        $this->info("✓ Đã tạo {$billCreationReminders} nhắc nhở tạo hóa đơn");
        $this->info("✓ Đã tạo {$billPaymentReminders} nhắc nhở thanh toán hóa đơn");
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
            $daysUntilExpiry = $today->diffInDays($endDate);
            
            // Tạo nhắc nhở nếu hợp đồng sắp hết hạn trong vòng 30 ngày
            // Kiểm tra xem đã có reminder chưa gửi cho hợp đồng này chưa
            $exists = Reminder::where('contract_id', $contract->id)
                ->where('type', 'contract_expiry')
                ->where('is_sent', false)
                ->exists();

            if (!$exists) {
                $reminderDate = $today; // Tạo nhắc nhở ngay hôm nay
                $urgencyMessage = '';
                
                if ($daysUntilExpiry <= 7) {
                    $urgencyMessage = "KHẨN CẤP! ";
                } elseif ($daysUntilExpiry <= 14) {
                    $urgencyMessage = "CHÚ Ý! ";
                }
                
                Reminder::create([
                    'contract_id' => $contract->id,
                    'type' => 'contract_expiry',
                    'reminder_date' => $reminderDate,
                    'message' => "{$urgencyMessage}Hợp đồng sẽ hết hạn vào ngày {$endDate->format('d/m/Y')} " .
                                "(còn {$daysUntilExpiry} ngày). " .
                                "Vui lòng liên hệ người thuê để gia hạn hoặc chấm dứt hợp đồng.",
                    'is_sent' => false,
                ]);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Generate reminders for creating monthly bills
     * Kiểm tra phòng có contract active và chưa có hóa đơn tháng này
     */
    private function generateBillCreationReminders()
    {
        $count = 0;
        $today = Carbon::today();
        $currentMonth = $today->month;
        $currentYear = $today->year;

        // Lấy tất cả hợp đồng đang active
        $contracts = Contract::where('status', 'active')->with('room')->get();

        foreach ($contracts as $contract) {
            // Kiểm tra xem đã có hóa đơn cho tháng này chưa
            $billExists = Bill::where('contract_id', $contract->id)
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->exists();

            if (!$billExists) {
                // Tạo nhắc nhở vào ngày 1-3 của tháng để tạo hóa đơn
                $reminderDate = Carbon::create($currentYear, $currentMonth, 3);

                // Chỉ tạo nếu ngày nhắc là hôm nay hoặc trong tương lai
                if ($reminderDate->gte($today)) {
                    // Kiểm tra xem đã có reminder chưa
                    $reminderExists = Reminder::where('contract_id', $contract->id)
                        ->where('type', 'bill_creation')
                        ->where('reminder_date', $reminderDate)
                        ->exists();

                    if (!$reminderExists) {
                        Reminder::create([
                            'contract_id' => $contract->id,
                            'type' => 'bill_creation',
                            'reminder_date' => $reminderDate,
                            'message' => "Chưa tạo hóa đơn cho phòng {$contract->room->name} tháng {$currentMonth}/{$currentYear}. " .
                                        "Vui lòng tạo hóa đơn cho khách thuê.",
                            'is_sent' => false,
                        ]);
                        $count++;
                    }
                }
            }
        }

        return $count;
    }

    /**
     * Generate reminders for unpaid bills approaching due date
     * Kiểm tra hóa đơn chưa thanh toán và sắp đến hạn
     */
    private function generateBillPaymentReminders()
    {
        $count = 0;
        $today = Carbon::today();

        // Lấy tất cả hóa đơn chưa thanh toán hoặc thanh toán một phần
        $bills = Bill::whereIn('status', ['pending', 'partial'])
            ->with(['contract.room', 'renterRequest'])
            ->get();

        foreach ($bills as $bill) {
            $dueDate = Carbon::parse($bill->due_date);
            $daysUntilDue = $today->diffInDays($dueDate, false);
            
            // Nếu hóa đơn sắp đến hạn (trong vòng 3 ngày) hoặc đã quá hạn
            if ($daysUntilDue <= 3) {
                $reminderDate = $today; // Tạo nhắc nhở ngay hôm nay
                
                // Kiểm tra xem đã có reminder chưa
                $reminderExists = Reminder::where('bill_id', $bill->id)
                    ->where('type', 'bill_payment')
                    ->where('is_sent', false)
                    ->exists();

                if (!$reminderExists) {
                    $urgencyMessage = '';
                    
                    if ($daysUntilDue < 0) {
                        $urgencyMessage = "ĐÃ QUÁ HẠN " . abs($daysUntilDue) . " ngày! ";
                    } elseif ($daysUntilDue === 0) {
                        $urgencyMessage = "HÔM NAY LÀ HẠN CHÓT! ";
                    } elseif ($daysUntilDue <= 3) {
                        $urgencyMessage = "Còn {$daysUntilDue} ngày! ";
                    }

                    $remainingAmount = $bill->amount - $bill->paid_amount;

                    Reminder::create([
                        'contract_id' => $bill->contract_id,
                        'bill_id' => $bill->id,
                        'type' => 'bill_payment',
                        'reminder_date' => $reminderDate,
                        'message' => "{$urgencyMessage}Hóa đơn phòng {$bill->contract->room->name} tháng {$bill->month}/{$bill->year} " .
                                    "chưa thanh toán. Số tiền còn lại: " . number_format($remainingAmount, 0, ',', '.') . " ₫. " .
                                    "Hạn thanh toán: {$dueDate->format('d/m/Y')}",
                        'is_sent' => false,
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }
}
