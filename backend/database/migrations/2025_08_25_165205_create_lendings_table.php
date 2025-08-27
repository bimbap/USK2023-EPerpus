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
        Schema::create('lendings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_name')->constrained('users')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('book_id', 125)->constrained()->onUpdate('cascade')->onDelete('cascade');
            $table->string('lend_date', 125);
            $table->string('return_date', 50);
            $table->string('book_condition_lent', 125);
            $table->string('book_condition_returned', 125);
            $table->string('fine', 125);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lendings');
    }
};
