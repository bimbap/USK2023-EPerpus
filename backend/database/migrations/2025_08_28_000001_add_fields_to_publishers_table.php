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
        Schema::table('publishers', function (Blueprint $table) {
            $table->string('name')->nullable()->after('publisher_name');
            $table->text('address')->nullable()->after('name');
            $table->string('email')->nullable()->after('address');
            $table->string('phone', 20)->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publishers', function (Blueprint $table) {
            $table->dropColumn(['name', 'address', 'email', 'phone']);
        });
    }
};
