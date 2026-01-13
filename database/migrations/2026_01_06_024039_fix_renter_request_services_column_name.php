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
        // 1. Drop all foreign key constraints first
        Schema::table('renter_services', function (Blueprint $table) {
            $table->dropForeign('renter_request_services_renter_id_foreign');
            $table->dropForeign('renter_services_service_id_foreign');
        });

        // 2. Drop unique constraint
        Schema::table('renter_services', function (Blueprint $table) {
            $table->dropUnique('renter_services_renter_id_service_id_unique');
        });

        // 3. Rename column
        DB::statement('ALTER TABLE renter_services CHANGE renter_id renter_request_id BIGINT UNSIGNED NOT NULL');

        // 4. Rename table
        Schema::rename('renter_services', 'renter_request_services');

        // 5. Add new unique constraint with new column name
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->unique(['renter_request_id', 'service_id']);
        });

        // 6. Add new foreign keys
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->foreign('renter_request_id')->references('id')->on('renter_requests')->cascadeOnDelete();
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop new foreign key
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->dropForeign(['renter_request_id']);
        });

        // Rename back
        DB::statement('ALTER TABLE renter_request_services CHANGE renter_request_id renter_id BIGINT UNSIGNED NOT NULL');

        // Add old foreign key
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->foreign('renter_id')->references('id')->on('renters')->cascadeOnDelete();
        });

        // Drop new unique constraint
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->dropUnique(['renter_request_id', 'service_id']);
        });

        // Add old unique constraint
        Schema::table('renter_request_services', function (Blueprint $table) {
            $table->unique(['renter_id', 'service_id']);
        });
    }
};
