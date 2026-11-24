<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {

            // Allow imported students to register before setting passwords.
            $table->string('password')->nullable()->change();

            // Hashed activation code.
            $table->string('activation_code_hash')->nullable();

            // Activation code expiry.
            $table->timestamp('activation_code_expires_at')->nullable();

            // Student account activation date.
            $table->timestamp('activated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {

            $table->dropColumn([
                'activation_code_hash',
                'activation_code_expires_at',
                'activated_at',
            ]);

            $table->string('password')->nullable(false)->change();
        });
    }
};