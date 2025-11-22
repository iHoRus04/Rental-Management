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
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            // Nhắc nhở cho hợp đồng nào
            
            $table->enum('type', ['payment', 'contract_expiry'])->default('payment');
            // payment = nhắc thanh toán tiền
            // contract_expiry = nhắc sắp hết hợp đồng
            
            $table->date('reminder_date');
            // Ngày gửi nhắc nhở
            
            $table->text('message')->nullable();
            // Nội dung nhắc
            
            $table->boolean('is_sent')->default(false);
            // Đã gửi hay chưa
            
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
