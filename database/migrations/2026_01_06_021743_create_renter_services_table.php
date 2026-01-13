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
        Schema::create('renter_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('renter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2); // Giá cụ thể cho người thuê này
            $table->boolean('is_active')->default(true); // Trạng thái sử dụng
            $table->text('note')->nullable(); // Ghi chú riêng
            $table->date('start_date')->nullable(); // Ngày bắt đầu sử dụng
            $table->date('end_date')->nullable(); // Ngày kết thúc (nếu có)
            $table->timestamps();
            
            // Đảm bảo mỗi người thuê không có dịch vụ trùng lặp
            $table->unique(['renter_id', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('renter_services');
    }
};
