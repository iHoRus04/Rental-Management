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
        Schema::create('renters', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // Tên người thuê
            $table->string('phone');         // SĐT
            $table->string('email')->nullable(); // Email
            $table->string('id_number');     // CCCD
            $table->string('address')->nullable(); // Địa chỉ
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('renters');
    }
};
