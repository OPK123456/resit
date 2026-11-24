<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'credit_hours',
        'level',
        'semester',
    ];

    protected function casts(): array
    {
        return [
            'credit_hours' => 'integer',
            'level' => 'integer',
            'semester' => 'integer',
        ];
    }

    // A course can have many examination results.
    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    // A course can have many resit registrations.
    public function resitRegistrations(): HasMany
    {
        return $this->hasMany(ResitRegistration::class);
    }
}