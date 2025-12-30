<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Thay đổi enum type để thêm bill_creation và bill_payment
        DB::statement("ALTER TABLE reminders MODIFY COLUMN type ENUM('payment', 'contract_expiry', 'bill_creation', 'bill_payment') DEFAULT 'payment'");
        
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
            $table->dropForeign(['bill_id']);
            $table->dropColumn('bill_id');
        });
        
        DB::statement("ALTER TABLE reminders MODIFY COLUMN type ENUM('payment', 'contract_expiry') DEFAULT 'payment'");
    }
};
