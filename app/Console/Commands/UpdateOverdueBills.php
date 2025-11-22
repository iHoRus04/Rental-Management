<?php

namespace App\Console\Commands;

use App\Services\BillService;
use Illuminate\Console\Command;

class UpdateOverdueBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bills:update-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật status các hóa đơn quá hạn';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $billService = new BillService();

        $this->info("Đang cập nhật hóa đơn quá hạn...");

        $billService->updateOverdueBills();

        $this->info("✓ Đã cập nhật xong");
    }
}
