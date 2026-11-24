<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StudentAuthController extends Controller
{
    /**
     * Activate an existing student account.
     */
    public function activate(Request $request)
    {
        $validated = $request->validate([
            'index_number' => ['required', 'string'],
            'activation_code' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $student = Student::where(
            'index_number',
            $validated['index_number']
        )->first();

        if (!$student || !$student->is_active) {
            throw ValidationException::withMessages([
                'index_number' => ['Invalid student details.'],
            ]);
        }

        if ($student->activated_at || $student->password) {
            throw ValidationException::withMessages([
                'index_number' => ['This account has already been activated.'],
            ]);
        }

        if (
            !$student->activation_code_hash ||
            !$student->activation_code_expires_at ||
            $student->activation_code_expires_at->isPast() ||
            !Hash::check(
                $validated['activation_code'],
                $student->activation_code_hash
            )
        ) {
            throw ValidationException::withMessages([
                'activation_code' => ['Invalid or expired activation code.'],
            ]);
        }

        $student->password = $validated['password'];
        $student->activated_at = now();
        $student->activation_code_hash = null;
        $student->activation_code_expires_at = null;

        $student->save();

        $token = $student->createToken('student-portal')->plainTextToken;

        return response()->json([
            'message' => 'Your account has been activated successfully.',
            'student' => $student,
            'token' => $token,
        ], 201);
    }

    /**
     * Student login.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'index_number' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $student = Student::where(
            'index_number',
            $validated['index_number']
        )->first();

        if (
            !$student ||
            !$student->is_active ||
            !$student->activated_at ||
            !$student->password ||
            !Hash::check($validated['password'], $student->password)
        ) {
            throw ValidationException::withMessages([
                'index_number' => ['The provided login details are incorrect.'],
            ]);
        }

        $token = $student->createToken('student-portal')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'student' => $student,
            'token' => $token,
        ]);
    }

    /**
     * Student logout.
     */
    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}