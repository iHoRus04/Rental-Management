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
        // Check if column exists before renaming
        if (Schema::hasColumn('contracts', 'renter_id')) {
            // Simply rename the column - no need to drop/recreate foreign keys
            DB::statement('ALTER TABLE contracts CHANGE renter_id renter_request_id BIGINT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the rename
        if (Schema::hasColumn('contracts', 'renter_request_id')) {
            DB::statement('ALTER TABLE contracts CHANGE renter_request_id renter_id BIGINT UNSIGNED NOT NULL');
        }
    }
};
