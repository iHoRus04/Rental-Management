<?php

namespace App\Console\Commands;

use App\Services\BillService;
use Illuminate\Console\Command;

class GenerateMonthlyBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bills:generate-monthly {--month=} {--year=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động tạo hóa đơn hàng tháng cho tất cả hợp đồng còn hoạt động';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $billService = new BillService();

        $month = $this->option('month') ?? now()->month;
        $year = $this->option('year') ?? now()->year;

        $this->info("Đang tạo hóa đơn cho tháng {$month}/{$year}...");

        $count = $billService->generateMonthlyBills($month, $year);

        $this->info("✓ Đã tạo {$count} hóa đơn");
    }
}
