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
        // 1. Drop renter_id from contracts if exists
        Schema::table('contracts', function (Blueprint $table) {
            if (Schema::hasColumn('contracts', 'renter_id')) {
                $table->dropForeign(['renter_id']);
                $table->dropColumn('renter_id');
            }
        });

        // 2. Make renter_request_id not nullable if it exists
        if (Schema::hasColumn('contracts', 'renter_request_id')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->foreignId('renter_request_id')->nullable(false)->change();
            });
        }

        // 3. Rename renter_services table to renter_request_services
        if (Schema::hasTable('renter_services')) {
            // Drop foreign key with correct name
            Schema::table('renter_services', function (Blueprint $table) {
                $table->dropForeign(['renter_id']);
            });
            
            // Rename table
            Schema::rename('renter_services', 'renter_request_services');
            
            // Rename column
            Schema::table('renter_request_services', function (Blueprint $table) {
                $table->renameColumn('renter_id', 'renter_request_id');
            });
            
            // Add new foreign key
            Schema::table('renter_request_services', function (Blueprint $table) {
                $table->foreign('renter_request_id')->references('id')->on('renter_requests')->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse: renter_request_services back to renter_services
        if (Schema::hasTable('renter_request_services')) {
            Schema::table('renter_request_services', function (Blueprint $table) {
                $table->dropForeign(['renter_request_id']);
                $table->renameColumn('renter_request_id', 'renter_id');
            });
            
            Schema::table('renter_request_services', function (Blueprint $table) {
                $table->foreign('renter_id')->references('id')->on('renters')->cascadeOnDelete();
            });
            
            Schema::rename('renter_request_services', 'renter_services');
        }

        // Reverse: contracts
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['renter_request_id']);
            $table->dropColumn('renter_request_id');
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->foreignId('renter_id')->after('room_id')->constrained('renters')->cascadeOnDelete();
        });
    }
};
