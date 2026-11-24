<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Result extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'academic_year',
        'semester',
        'score',
        'grade',
        'is_resit_eligible',
        'imported_by',
    ];

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'score' => 'decimal:2',
            'is_resit_eligible' => 'boolean',
        ];
    }

    // The result belongs to a student.
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // The result belongs to a course.
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // The administrator who imported the result.
    public function importer(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'imported_by');
    }

    // A result can have resit registrations.
    public function resitRegistrations(): HasMany
    {
        return $this->hasMany(ResitRegistration::class);
    }
}