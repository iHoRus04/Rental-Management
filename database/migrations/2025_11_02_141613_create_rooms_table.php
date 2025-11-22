<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('house_id')
                ->references('id')->on('houses')
                ->cascadeOnDelete();

            $table->string('name');
            $table->unique(['house_id', 'name']); // Mỗi nhà có phòng riêng

            $table->decimal('price', 10, 2)->default(0);
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->integer('floor')->nullable();
            $table->float('area')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
