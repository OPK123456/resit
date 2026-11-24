<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->unsignedTinyInteger('credit_hours')->default(3);
            $table->unsignedTinyInteger('level')->nullable();
            $table->unsignedTinyInteger('semester')->nullable();
            $table->decimal('resit_fee', 10, 2)->nullable(); // overrides the period fee when set
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};