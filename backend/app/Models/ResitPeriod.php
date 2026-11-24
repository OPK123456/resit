<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResitPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'academic_year',
        'semester',
        'start_date',
        'end_date',
        'fee_per_course',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'fee_per_course' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // The administrator who created this resit period.
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    // A resit period can have many registrations.
    public function resitRegistrations(): HasMany
    {
        return $this->hasMany(ResitRegistration::class);
    }

    // A resit period can have many payments.
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}