<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    // Display all courses.
    public function index()
    {
        return response()->json(
            Course::latest()->paginate(20)
        );
    }

    // Create a new course.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                'unique:courses,code',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'credit_hours' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'level' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'semester' => [
                'nullable',
                'integer',
                'min:1',
            ],
        ]);

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course,
        ], 201);
    }

    // Display one course.
    public function show(Course $course)
    {
        return response()->json([
            'course' => $course,
        ]);
    }

    // Update course information.
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'code')->ignore($course->id),
            ],
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'credit_hours' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],
            'level' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],
            'semester' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => $course,
        ]);
    }

    // Delete a course.
    public function destroy(Course $course)
    {
        if (
            $course->results()->exists() ||
            $course->resitRegistrations()->exists()
        ) {
            return response()->json([
                'message' => 'This course cannot be deleted because it has existing student records or resit registrations.',
            ], 409);
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }
}