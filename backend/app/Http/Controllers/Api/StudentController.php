<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Display all students with statistics.
     */
    public function index()
    {
        $students = Student::latest()->paginate(20);

        $statistics = [
            'total' => Student::count(),

            'active' => Student::where('is_active', true)->count(),

            'inactive' => Student::where('is_active', false)->count(),
        ];

        return response()->json([
            'students' => $students,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Create a student record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'index_number' => [
                'required',
                'string',
                'max:255',
                'unique:students,index_number'
            ],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:students,email'
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'programme' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'integer', 'min:1'],
        ]);

        $student = Student::create([
            ...$validated,
            'password' => null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Student record created successfully.',
            'student' => $student,
        ], 201);
    }

    /**
     * Display one student.
     */
    public function show(Student $student)
    {
        return response()->json([
            'student' => $student,
        ]);
    }

    /**
     * Update student information.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'index_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('students', 'index_number')->ignore($student->id),
            ],

            'first_name' => [
                'sometimes',
                'required',
                'string',
                'max:255'
            ],

            'last_name' => [
                'sometimes',
                'required',
                'string',
                'max:255'
            ],

            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
                Rule::unique('students', 'email')->ignore($student->id),
            ],

            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],

            'programme' => ['sometimes', 'nullable', 'string', 'max:255'],

            'level' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $student->update($validated);

        return response()->json([
            'message' => 'Student record updated successfully.',
            'student' => $student,
        ]);
    }

    /**
     * Deactivate a student account.
     */
    public function destroy(Student $student)
    {
        $student->is_active = false;

        $student->tokens()->delete();

        $student->save();

        return response()->json([
            'message' => 'Student account deactivated successfully.',
        ]);
    }

    /**
     * Generate and issue a student activation code.
     *
     * Delivery methods:
     * manual - Return the code to the administrator.
     * email  - Send the code to the student's registered email.
     */
    public function issueActivationCode(Request $request, Student $student)
    {
        $validated = $request->validate([
            'method' => ['required', Rule::in(['manual', 'email'])],
        ]);

        if (!$student->is_active) {
            return response()->json([
                'message' => 'This student account is inactive.',
            ], 422);
        }

        if ($student->activated_at || $student->password) {
            return response()->json([
                'message' => 'This student account has already been activated.',
            ], 422);
        }

        if ($validated['method'] === 'email' && !$student->email) {
            return response()->json([
                'message' => 'This student does not have a registered email address.',
            ], 422);
        }

        $activationCode = Str::upper(Str::random(8));

        $student->activation_code_hash = Hash::make($activationCode);

        $student->activation_code_expires_at = now()->addHours(24);

        $student->save();

        if ($validated['method'] === 'email') {
            try {
                Mail::raw(
                    "Your School Resit Portal activation code is: {$activationCode}\n\n"
                    . "This code expires in 24 hours. Do not share it with anyone.",
                    function ($message) use ($student) {
                        $message->to($student->email)
                            ->subject('School Resit Portal - Account Activation');
                    }
                );

            } catch (\Throwable $exception) {
                report($exception);

                return response()->json([
                    'message' => 'The activation code was generated, but the email could not be sent. Please check the mail configuration or issue a new code manually.',
                ], 502);
            }

            return response()->json([
                'message' => 'Activation code sent to the student email address.',
            ]);
        }

        return response()->json([
            'message' => 'Activation code generated successfully. Give this code to the student.',
            'activation_code' => $activationCode,
            'expires_at' => $student->activation_code_expires_at,
        ]);
    }
}