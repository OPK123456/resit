<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // Student who made the payment.
            // Prevent deleting a student who has payment records.
            $table->foreignId('student_id')
                ->constrained()
                ->restrictOnDelete();

            // Resit period associated with the payment.
            // Prevent deleting a period with payment records.
            $table->foreignId('resit_period_id')
                ->constrained()
                ->restrictOnDelete();

            // Payment amount in Ghana cedis.
            $table->decimal('amount', 10, 2);

            $table->string('currency', 3)->default('GHS');

            // Unique payment reference.
            $table->string('reference')->unique();

            // paystack, cash, bank_deposit or mobile_money.
            $table->string('method');

            // pending, paid, failed or rejected.
            $table->string('status')->default('pending');

            $table->timestamp('paid_at')->nullable();

            // Administrator who verified a manual payment.
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            // Paystack transaction and verification information.
            $table->json('gateway_response')->nullable();

            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};