<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'resit_period_id',
        'amount',
        'currency',
        'reference',
        'method',
        'status',
        'paid_at',
        'verified_by',
        'gateway_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'gateway_response' => 'array',
        ];
    }

    // The payment belongs to a student.
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // The payment belongs to a resit period.
    public function resitPeriod(): BelongsTo
    {
        return $this->belongsTo(ResitPeriod::class);
    }

    // The administrator who verified the payment.
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by');
    }

    // A payment can have one receipt.
    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }

    // A payment can cover multiple resit registrations.
    public function resitRegistrations(): HasMany
    {
        return $this->hasMany(ResitRegistration::class);
    }
}