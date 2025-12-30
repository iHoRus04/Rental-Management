<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Use JSON if your MySQL version supports it, otherwise use text
            try {
                // Attempt to add JSON column; older platforms will throw
                $table->json('images')->nullable()->after('description');
            } catch (\Throwable $e) {
                // Fallback to text if JSON not supported
                $table->text('images')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('rooms', function (Blueprint $table) {
            if (Schema::hasColumn('rooms', 'images')) {
                $table->dropColumn('images');
            }
        });
    }
};
