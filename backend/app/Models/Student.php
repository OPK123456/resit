<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'index_number',
        'first_name',
        'last_name',
        'email',
        'phone',
        'programme',
        'level',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'activation_code_hash',
        'activation_code_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'level' => 'integer',
            'activation_code_expires_at' => 'datetime',
            'activated_at' => 'datetime',
        ];
    }

    // Student examination results
    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    // Student resit registrations
    public function resitRegistrations(): HasMany
    {
        return $this->hasMany(ResitRegistration::class);
    }

    // Student payments
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Student notifications
    public function notifications(): HasMany
    {
        return $this->hasMany(StudentNotification::class);
    }
}