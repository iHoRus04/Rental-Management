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
        Schema::table('contracts', function (Blueprint $table) {
            // Drop foreign key constraint if exists
            try {
                $table->dropForeign('contracts_renter_id_foreign');
            } catch (\Exception $e) {
                // Foreign key doesn't exist
            }
            
            // Drop renter_id column
            $table->dropColumn('renter_id');
            
            // Add renter_request_id column
            $table->unsignedBigInteger('renter_request_id')->nullable();
            $table->foreign('renter_request_id')->references('id')->on('renter_requests')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Drop foreign key
            try {
                $table->dropForeign('contracts_renter_request_id_foreign');
            } catch (\Exception $e) {
                // Foreign key doesn't exist
            }
            
            // Drop renter_request_id
            $table->dropColumn('renter_request_id');
            
            // Add renter_id back
            $table->unsignedBigInteger('renter_id')->nullable();
            $table->foreign('renter_id')->references('id')->on('renters')->onDelete('cascade');
        });
    }
};
