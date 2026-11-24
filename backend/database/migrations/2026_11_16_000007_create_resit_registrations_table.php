<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resit_registrations', function (Blueprint $table) {
            $table->id();

            // Student associated with the registration.
            $table->foreignId('student_id')
                ->constrained()
                ->restrictOnDelete();

            // Course associated with the registration.
            $table->foreignId('course_id')
                ->constrained()
                ->restrictOnDelete();

            // Resit period associated with the registration.
            $table->foreignId('resit_period_id')
                ->constrained()
                ->restrictOnDelete();

            // Original examination result.
            $table->foreignId('result_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Payment associated with this registration.
            $table->foreignId('payment_id')
                ->nullable()
                ->constrained()
                ->restrictOnDelete();

            // pending, paid or cancelled.
            $table->string('status')->default('pending');

            $table->timestamps();

            // A student can register for a course only once
            // within the same resit period.
            $table->unique(
                ['student_id', 'course_id', 'resit_period_id'],
                'resit_reg_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resit_registrations');
    }
};