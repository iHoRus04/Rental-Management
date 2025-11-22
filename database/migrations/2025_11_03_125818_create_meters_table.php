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
        Schema::create('meters', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            // Chỉ số thuộc phòng nào
            
            $table->integer('month');
            $table->integer('year');
            // Để lưu kỳ ghi chỉ số, ví dụ: Tháng 1/2025
            
            $table->integer('electric_old')->default(0);
            $table->integer('electric_new')->default(0);
            // Chỉ số điện cũ và mới
            
            $table->integer('water_old')->default(0);
            $table->integer('water_new')->default(0);
            // Chỉ số nước cũ và mới
            
            $table->boolean('is_billed')->default(false);
            // Đánh dấu đã tạo hóa đơn hay chưa
            
            $table->timestamps();
        });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meters');
    }
};
