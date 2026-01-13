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
        // Thông báo bắt đầu (chạy trên CLI hoặc gọi từ controller)
        $this->info('Bắt đầu tạo nhắc nhở tự động...');

        // Chạy từng nhóm generator riêng biệt. Mỗi hàm trả về số lượng reminder mới tạo.
        // Thứ tự không quá quan trọng nhưng giữ logic tách biệt cho dễ bảo trì.
        $billCreationReminders = $this->generateBillCreationReminders();
        $billPaymentReminders = $this->generateBillPaymentReminders();
        $paymentReminders = $this->generatePaymentReminders();
        $expiryReminders = $this->generateContractExpiryReminders();

        // In kết quả tóm tắt
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
        // Tạo reminder nhắc thanh toán định kỳ cho các hợp đồng đang active.
        // Ý tưởng: tính ngày thanh toán tiếp theo dựa trên trường `payment_date` (giả sử lưu ngày trong tháng),
        // sau đó tạo reminder 5 ngày trước ngày thanh toán.
        $count = 0;
        $today = Carbon::today();
        $nextMonth = Carbon::today()->addMonth();

        // Lấy tất cả hợp đồng active để xử lý
        $contracts = Contract::where('status', 'active')->get();

        foreach ($contracts as $contract) {
            // Tạo ngày thanh toán trong tháng tiếp theo (dùng payment_date của hợp đồng)
            $nextPaymentDate = Carbon::create(
                $nextMonth->year,
                $nextMonth->month,
                $contract->payment_date
            );

            // Reminder: 5 ngày trước ngày thanh toán
            $reminderDate = $nextPaymentDate->copy()->subDays(5);

            // Chỉ tạo reminder nếu ngày reminder nằm trong tương lai (>= hôm nay)
            if ($reminderDate->gte($today)) {
                // Kiểm tra đã tồn tại reminder cùng loại cho cùng ngày chưa (tránh duplicate)
                $exists = Reminder::where('contract_id', $contract->id)
                    ->where('type', 'payment')
                    ->where('reminder_date', $reminderDate)
                    ->exists();

                if (!$exists) {
                    // Tạo reminder mới với message mô tả
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
        // Tạo nhắc nhở hợp đồng sắp hết hạn (trong 30 ngày tới)
        $count = 0;
        $today = Carbon::today();
        $in30Days = Carbon::today()->addDays(30);

        // Lọc hợp đồng active có end_date trong khoảng [today, in30Days]
        $contracts = Contract::where('status', 'active')
            ->whereBetween('end_date', [$today, $in30Days])
            ->get();

        foreach ($contracts as $contract) {
            $endDate = Carbon::parse($contract->end_date);
            $daysUntilExpiry = $today->diffInDays($endDate);
            
            // Nếu chưa có reminder chưa gửi cho loại này => tạo mới
            $exists = Reminder::where('contract_id', $contract->id)
                ->where('type', 'contract_expiry')
                ->where('is_sent', false)
                ->exists();

            if (!$exists) {
                // Tạo nhắc nhở ngay hôm nay, thêm thông điệp khẩn nếu cận hạn
                $reminderDate = $today;
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
        // Tạo nhắc nhở yêu cầu tạo hóa đơn cho những hợp đồng chưa có bill của tháng hiện tại
        $count = 0;
        $today = Carbon::today();
        $currentMonth = $today->month;
        $currentYear = $today->year;

        // Lấy danh sách hợp đồng active kèm thông tin phòng để hiển thị tên
        $contracts = Contract::where('status', 'active')->with('room')->get();

        foreach ($contracts as $contract) {
            // Kiểm tra đã có bill cho tháng hiện tại hay chưa
            $billExists = Bill::where('contract_id', $contract->id)
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->exists();

            if (!$billExists) {
                // Chúng ta chọn ngày reminder vào ngày 3 của tháng (1-3)
                $reminderDate = Carbon::create($currentYear, $currentMonth, 3);

                // Nếu ngày reminder chưa qua (>= hôm nay) thì tạo reminder
                if ($reminderDate->gte($today)) {
                    // Tránh tạo trùng
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
        // Tạo reminder cho các hóa đơn chưa thanh toán hoặc thanh toán một phần khi
        // hạn thanh toán đang đến gần (<= 3 ngày) hoặc đã quá hạn.
        $count = 0;
        $today = Carbon::today();

        // Lấy tất cả hóa đơn có status pending hoặc partial để kiểm tra
        $bills = Bill::whereIn('status', ['pending', 'partial'])
            ->with(['contract.room', 'renterRequest'])
            ->get();

        foreach ($bills as $bill) {
            $dueDate = Carbon::parse($bill->due_date);
            // diffInDays với tham số false cho phép trả âm nếu quá hạn
            $daysUntilDue = $today->diffInDays($dueDate, false);
            
            // Nếu trong vòng 3 ngày tới hoặc đã quá hạn
            if ($daysUntilDue <= 3) {
                $reminderDate = $today; // chúng ta tạo reminder ngay hôm nay
                
                // Tránh tạo trùng reminder cho cùng bill chưa gửi
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
