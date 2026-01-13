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
        Schema::create('room_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2); // Giá cụ thể cho phòng này (có thể khác giá mặc định)
            $table->boolean('is_active')->default(true); // Trạng thái sử dụng cho phòng
            $table->text('note')->nullable(); // Ghi chú riêng cho phòng
            $table->timestamps();
            
            // Đảm bảo mỗi phòng không có dịch vụ trùng lặp
            $table->unique(['room_id', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_services');
    }
};
