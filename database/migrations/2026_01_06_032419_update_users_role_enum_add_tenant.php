<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modify the role enum to include 'tenant'
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'landlord', 'tenant') NOT NULL DEFAULT 'landlord'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'tenant' from enum
        if (DB::connection()->getDriverName() !== 'sqlite') {
            // Cập nhật các user có vai trò khác admin/landlord thành landlord trước khi thay đổi enum
            DB::table('users')->whereNotIn('role', ['admin', 'landlord'])->update(['role' => 'landlord']);

            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'landlord') NOT NULL DEFAULT 'landlord'");
        }
    }
};
