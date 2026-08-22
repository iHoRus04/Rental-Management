<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // === BILLS TABLE: Thêm snapshot biểu giá & audit ===
        Schema::table('bills', function (Blueprint $table) {
            $table->json('price_snapshot')->nullable()->after('notes');
            $table->json('service_details')->nullable()->after('price_snapshot');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('service_details');
        });

        // Thêm 'overdue' vào enum status
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending'");
        }

        // === PAYMENTS TABLE: Audit trail ===
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()->after('notes');
            $table->string('bank_transaction_code')->nullable()->after('verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                $table->dropForeign(['verified_by']);
            }
            $table->dropColumn(['verified_by', 'bank_transaction_code']);
        });

        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('pending', 'partial', 'paid') DEFAULT 'pending'");
        }

        Schema::table('bills', function (Blueprint $table) {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                $table->dropForeign(['created_by']);
            }
            $table->dropColumn(['price_snapshot', 'service_details', 'created_by']);
        });
    }
};
