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
        Schema::create('meter_logs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            // Liên kết tới phòng
            
            $table->integer('month');
            $table->integer('year');
            // Kỳ ghi chỉ số (tháng/năm)
            
            $table->integer('electric_reading')->default(0);
            $table->integer('water_reading')->default(0);
            // Chỉ số điện (kWh) và nước (m³)
            
            $table->integer('electric_usage')->nullable();
            $table->integer('water_usage')->nullable();
            // Số lượng sử dụng (tính từ chỉ số tháng trước)
            
            $table->text('notes')->nullable();
            // Ghi chú
            
            $table->unique(['room_id', 'month', 'year']);
            // Mỗi phòng chỉ có 1 bản ghi/tháng
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_logs');
    }
};
