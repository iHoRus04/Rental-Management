<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Thêm các cột mới vào bảng users nếu chưa có
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['pending', 'active', 'inactive'])->default('pending')->after('role');
            }
            if (!Schema::hasColumn('users', 'landlord_id')) {
                $table->foreignId('landlord_id')->nullable()->constrained('users')->onDelete('set null')->after('status');
            }
        });

        // Cập nhật enum role để thêm 'staff' nếu chưa có (chỉ MySQL)
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','landlord','tenant','staff') NOT NULL DEFAULT 'tenant'");
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'landlord_id')) {
                $table->dropForeign(['landlord_id']);
                $table->dropColumn('landlord_id');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
