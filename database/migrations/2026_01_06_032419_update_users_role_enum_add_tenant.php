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
        // Modify the role enum to include 'tenant'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'landlord', 'tenant') NOT NULL DEFAULT 'landlord'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'tenant' from enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'landlord') NOT NULL DEFAULT 'landlord'");
    }
};
