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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('bill_id')->constrained()->cascadeOnDelete();
            // Hóa đơn được thanh toán
            
            $table->decimal('amount', 10, 2);
            // Số tiền thanh toán
            
            $table->date('payment_date');
            // Ngày thanh toán
            
            $table->enum('payment_method', ['cash', 'bank_transfer', 'check', 'other'])->default('cash');
            // Phương thức thanh toán
            
            $table->string('reference')->nullable();
            // Mã tham chiếu (STK, số séc, ...)
            
            $table->text('notes')->nullable();
            // Ghi chú
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
