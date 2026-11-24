<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentNotification extends Model
{
    use HasFactory;

    // Use the existing notifications table.
    protected $table = 'notifications';

    protected $fillable = [
        'student_id',
        'title',
        'message',
        'type',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    // A notification belongs to one student.
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}