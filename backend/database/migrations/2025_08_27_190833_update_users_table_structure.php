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
        Schema::table('users', function (Blueprint $table) {
            // Extend password field length for bcrypt (60 chars needed)
            $table->string('password', 255)->change();
            
            // Add email and phone_number fields
            $table->string('email')->unique()->after('username');
            $table->string('phone_number', 15)->after('email');
            
            // Split class field to separate fields
            $table->string('jurusan', 50)->after('class');
            
            // Modify class field to enum
            $table->enum('class', ['X', 'XI', 'XII'])->change();
            
            // Remove address field (if exists)
            if (Schema::hasColumn('users', 'address')) {
                $table->dropColumn('address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Reverse the changes
            $table->string('password', 50)->change();
            $table->dropColumn(['email', 'phone_number', 'jurusan']);
            $table->string('class', 50)->change();
            $table->text('address')->nullable();
        });
    }
};
