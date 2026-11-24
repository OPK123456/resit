<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResitRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'resit_period_id',
        'result_id',
        'payment_id',
        'status',
    ];

    // The registration belongs to a student.
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // The registration belongs to a course.
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // The registration belongs to a resit period.
    public function resitPeriod(): BelongsTo
    {
        return $this->belongsTo(ResitPeriod::class);
    }

    // The examination result that qualifies the student.
    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class);
    }

    // The payment associated with this registration.
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}