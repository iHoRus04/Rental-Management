<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            // Drop the old foreign key if it exists
            try {
                $table->dropForeign('bills_renter_id_foreign');
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }

            // Drop the old renter_id column
            if (Schema::hasColumn('bills', 'renter_id')) {
                $table->dropColumn('renter_id');
            }

            // Add the new renter_request_id column
            if (!Schema::hasColumn('bills', 'renter_request_id')) {
                $table->unsignedBigInteger('renter_request_id')->nullable()->after('contract_id');
                $table->foreign('renter_request_id')->references('id')->on('renter_requests')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            // Drop the new foreign key if it exists
            try {
                $table->dropForeign('bills_renter_request_id_foreign');
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }

            // Drop the renter_request_id column
            if (Schema::hasColumn('bills', 'renter_request_id')) {
                $table->dropColumn('renter_request_id');
            }

            // Add the old renter_id column back
            if (!Schema::hasColumn('bills', 'renter_id')) {
                $table->unsignedBigInteger('renter_id')->nullable()->after('contract_id');
                $table->foreign('renter_id')->references('id')->on('renters')->onDelete('cascade');
            }
        });
    }
};
