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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('renter_id')->constrained()->cascadeOnDelete();
            // Liên kết hợp đồng, phòng, người thuê
            
            $table->integer('month');
            $table->integer('year');
            // Kỳ hóa đơn
            
            $table->decimal('room_price', 10, 2);
            // Tiền phòng
            
            $table->integer('electric_kwh')->default(0);
            $table->decimal('electric_cost', 10, 2)->default(0);
            // Số kWh điện và tiền điện
            
            $table->integer('water_usage')->default(0);
            $table->decimal('water_cost', 10, 2)->default(0);
            // Số m3 nước và tiền nước
            
            $table->decimal('internet_cost', 10, 2)->default(0);
            $table->decimal('trash_cost', 10, 2)->default(0);
            $table->decimal('other_costs', 10, 2)->default(0);
            // Internet, rác, chi phí khác
            
            $table->decimal('amount', 10, 2);
            // Tổng tiền hóa đơn
            
            $table->decimal('paid_amount', 10, 2)->default(0);
            // Số tiền đã thanh toán
            
            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending');
            // pending = chưa thanh toán
            // partial = thanh toán một phần
            // paid = đã thanh toán đủ
            
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            // Hạn thanh toán & ngày thanh toán
            
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
        Schema::dropIfExists('bills');
    }
};
