<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Remove existing foreign keys.
            $table->dropForeign(['student_id']);
            $table->dropForeign(['resit_period_id']);

            // Protect payment history.
            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->restrictOnDelete();

            $table->foreign('resit_period_id')
                ->references('id')
                ->on('resit_periods')
                ->restrictOnDelete();
        });

        Schema::table('resit_registrations', function (Blueprint $table) {
            // Remove existing foreign keys.
            $table->dropForeign(['student_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['resit_period_id']);
            $table->dropForeign(['payment_id']);

            // Protect registration history.
            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->restrictOnDelete();

            $table->foreign('course_id')
                ->references('id')
                ->on('courses')
                ->restrictOnDelete();

            $table->foreign('resit_period_id')
                ->references('id')
                ->on('resit_periods')
                ->restrictOnDelete();

            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('resit_registrations', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['resit_period_id']);
            $table->dropForeign(['payment_id']);

            $table->foreign('student_id')
                ->references('id')->on('students')->cascadeOnDelete();

            $table->foreign('course_id')
                ->references('id')->on('courses')->cascadeOnDelete();

            $table->foreign('resit_period_id')
                ->references('id')->on('resit_periods')->cascadeOnDelete();

            $table->foreign('payment_id')
                ->references('id')->on('payments')->nullOnDelete();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropForeign(['resit_period_id']);

            $table->foreign('student_id')
                ->references('id')->on('students')->cascadeOnDelete();

            $table->foreign('resit_period_id')
                ->references('id')->on('resit_periods')->cascadeOnDelete();
        });
    }
};