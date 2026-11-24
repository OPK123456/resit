<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\Student;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ResultController extends Controller
{
    // Display all examination results
    public function index(Request $request)
    {
        $query = Result::with(['student', 'course']);

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        return response()->json(
            $query->latest()->paginate(20)
        );
    }

    // Add an examination result
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'string', 'max:50'],
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade' => ['nullable', 'string', 'max:5'],
        ]);

        $existingResult = Result::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('academic_year', $validated['academic_year'])
            ->where('semester', $validated['semester'])
            ->exists();

        if ($existingResult) {
            return response()->json([
                'message' => 'A result already exists for this student and course in the selected academic period.',
            ], 409);
        }

        $score = $validated['score'];

        $result = Result::create([
            ...$validated,
            'is_resit_eligible' => $score < 50,
            'imported_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Examination result recorded successfully.',
            'result' => $result,
            'status' => $score >= 50 ? 'Pass' : 'Fail',
        ], 201);
    }

    // Display one examination result
    public function show(Result $result)
    {
        return response()->json([
            'result' => $result->load(['student', 'course']),
        ]);
    }

    // Update an examination result
    public function update(Request $request, Result $result)
    {
        $validated = $request->validate([
            'student_id' => ['sometimes', 'required', 'exists:students,id'],
            'course_id' => ['sometimes', 'required', 'exists:courses,id'],
            'academic_year' => ['sometimes', 'required', 'string', 'max:20'],
            'semester' => ['sometimes', 'required', 'string', 'max:50'],
            'score' => ['sometimes', 'required', 'numeric', 'min:0', 'max:100'],
            'grade' => ['sometimes', 'nullable', 'string', 'max:5'],
        ]);

        $studentId = $validated['student_id'] ?? $result->student_id;
        $courseId = $validated['course_id'] ?? $result->course_id;
        $academicYear = $validated['academic_year'] ?? $result->academic_year;
        $semester = $validated['semester'] ?? $result->semester;

        $duplicate = Result::where('student_id', $studentId)
            ->where('course_id', $courseId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->where('id', '!=', $result->id)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'Another result already exists for this student and course in the selected academic period.',
            ], 409);
        }

        $result->fill($validated);

        $result->is_resit_eligible = $result->score < 50;

        $result->save();

        return response()->json([
            'message' => 'Examination result updated successfully.',
            'result' => $result,
            'status' => $result->score >= 50 ? 'Pass' : 'Fail',
        ]);
    }

    // Delete an examination result
    public function destroy(Result $result)
    {
        if ($result->resitRegistrations()->exists()) {
            return response()->json([
                'message' => 'This result cannot be deleted because it is linked to a resit registration.',
            ], 409);
        }

        $result->delete();

        return response()->json([
            'message' => 'Examination result deleted successfully.',
        ]);
    }
}