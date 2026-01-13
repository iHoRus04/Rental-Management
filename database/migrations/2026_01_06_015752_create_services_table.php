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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên dịch vụ: Điện, Nước, Internet, Vệ sinh...
            $table->text('description')->nullable(); // Mô tả dịch vụ
            $table->decimal('default_price', 10, 2)->default(0); // Giá mặc định
            $table->enum('unit', ['kwh', 'm3', 'month', 'service'])->default('service'); // Đơn vị tính
            $table->boolean('is_active')->default(true); // Trạng thái kích hoạt
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
