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
        Schema::table('tenant_requests', function (Blueprint $table) {
            $table->foreignId('assigned_to')->nullable()->after('room_id')->constrained('users')->nullOnDelete();
            $table->text('images')->nullable()->after('description');
            $table->text('resolved_images')->nullable()->after('landlord_response');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_requests', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assigned_to', 'images', 'resolved_images']);
        });
    }
};
