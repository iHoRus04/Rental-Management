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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('renter_id')->constrained('renters')->cascadeOnDelete();
            
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('monthly_rent', 12, 2);
            $table->decimal('deposit', 12, 2);
            $table->integer('payment_date');
            $table->text('terms')->nullable();
            
            $table->enum('status', ['active', 'terminated', 'expired'])->default('active');
            
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
