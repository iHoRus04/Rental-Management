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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['landlord', 'tenant'])->default('landlord')->after('email');
            }
            if (!Schema::hasColumn('users', 'renter_request_id')) {
                $table->foreignId('renter_request_id')->nullable()->after('role')->constrained('renter_requests')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['renter_request_id']);
            $table->dropColumn(['role', 'renter_request_id']);
        });
    }
};
