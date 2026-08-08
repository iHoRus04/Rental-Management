<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Thay đổi enum type để thêm bill_creation và bill_payment
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE reminders MODIFY COLUMN type ENUM('payment', 'contract_expiry', 'bill_creation', 'bill_payment') DEFAULT 'payment'");
        }
        
        // Thêm cột bill_id để liên kết với hóa đơn (nullable vì không phải reminder nào cũng liên quan đến bill)
        Schema::table('reminders', function (Blueprint $table) {
            $table->foreignId('bill_id')->nullable()->after('contract_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                $table->dropForeign(['bill_id']);
                $table->dropColumn('bill_id');
            }
        });
        
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE reminders MODIFY COLUMN type ENUM('payment', 'contract_expiry') DEFAULT 'payment'");
        }
    }
};
