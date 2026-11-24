<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('academic_year');          // e.g. 2025/2026
            $table->unsignedTinyInteger('semester');
            $table->decimal('score', 5, 2)->nullable();
            $table->string('grade', 3)->nullable();
            $table->boolean('is_resit_eligible')->default(false);
            $table->foreignId('imported_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'course_id', 'academic_year', 'semester']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};