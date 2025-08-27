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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiver')->constrained('users')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('sender')->constrained('users')->onUpdate('cascade')->onDelete('cascade');
            $table->string('message_title', 50);
            $table->text('message_content');
            $table->string('status', 50);
            $table->string('send_date', 50);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
