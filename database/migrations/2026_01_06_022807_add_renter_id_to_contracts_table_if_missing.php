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
        if (!Schema::hasColumn('contracts', 'renter_id')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->foreignId('renter_id')->nullable()->after('room_id')->constrained('renters')->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('contracts', 'renter_id')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->dropForeign(['renter_id']);
                $table->dropColumn('renter_id');
            });
        }
    }
};
