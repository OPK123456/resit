<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResitPeriod;
use App\Models\ResitRegistration;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentResitRegistrationController extends Controller
{
    /**
     * Display the student's existing resit registrations.
     */
    public function index(Request $request)
    {
        $student = $request->user();

        $registrations = ResitRegistration::with([
            'course',
            'resitPeriod',
            'result',
            'payment',
        ])
            ->where('student_id', $student->id)
            ->latest()
            ->paginate(20);

        return response()->json($registrations);
    }


    /**
     * Display courses the student is eligible to resit.
     */
    public function eligibleCourses(Request $request)
    {
        $student = $request->user();

        $validated = $request->validate([
            'resit_period_id' => 'required|exists:resit_periods,id',
        ]);

        $period = ResitPeriod::findOrFail(
            $validated['resit_period_id']
        );

        if (!$period->is_active) {
            return response()->json([
                'message' => 'This resit period is not active.',
            ], 422);
        }

        if (
            now()->toDateString() < $period->start_date->toDateString() ||
            now()->toDateString() > $period->end_date->toDateString()
        ) {
            return response()->json([
                'message' => 'This resit period is not currently open.',
            ], 422);
        }

        $results = Result::with('course')
            ->where('student_id', $student->id)
            ->where('academic_year', $period->academic_year)
            ->where('semester', $period->semester)
            ->where('is_resit_eligible', true)
            ->whereNotNull('score')
            ->where('score', '<', 50)

            // Cancelled registrations do not prevent re-registration.
            ->whereDoesntHave('resitRegistrations', function ($query) use ($period) {
                $query->where('resit_period_id', $period->id)
                    ->where('status', '!=', 'cancelled');
            })

            ->get();

        return response()->json([
            'resit_period' => $period,
            'eligible_courses' => $results,
        ]);
    }


    /**
     * Register selected failed courses for a resit.
     */
    public function store(Request $request)
    {
        $student = $request->user();

        $validated = $request->validate([
            'resit_period_id' => 'required|exists:resit_periods,id',

            'result_ids' => 'required|array|min:1|max:20',

            'result_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:results,id',
            ],
        ]);

        $period = ResitPeriod::findOrFail(
            $validated['resit_period_id']
        );

        if (!$period->is_active) {
            return response()->json([
                'message' => 'This resit period is not active.',
            ], 422);
        }

        if (
            now()->toDateString() < $period->start_date->toDateString() ||
            now()->toDateString() > $period->end_date->toDateString()
        ) {
            return response()->json([
                'message' => 'Registration for this resit period is currently closed.',
            ], 422);
        }

        $results = Result::with('course')
            ->where('student_id', $student->id)
            ->whereIn('id', $validated['result_ids'])
            ->where('academic_year', $period->academic_year)
            ->where('semester', $period->semester)
            ->where('is_resit_eligible', true)
            ->whereNotNull('score')
            ->where('score', '<', 50)
            ->get();

        if ($results->count() !== count($validated['result_ids'])) {
            return response()->json([
                'message' => 'One or more selected courses are not eligible for resit registration.',
            ], 422);
        }

        $registrations = DB::transaction(function () use (
            $results,
            $student,
            $period
        ) {
            $created = [];

            foreach ($results as $result) {

                // Check whether a registration already exists.
                $existingRegistration = ResitRegistration::where(
                    'student_id',
                    $student->id
                )
                    ->where('course_id', $result->course_id)
                    ->where('resit_period_id', $period->id)
                    ->lockForUpdate()
                    ->first();

                if ($existingRegistration) {

                    // Only cancelled registrations without payments
                    // can be activated again.
                    if (
                        $existingRegistration->status === 'cancelled' &&
                        $existingRegistration->payment_id === null
                    ) {
                        $existingRegistration->update([
                            'result_id' => $result->id,
                            'status' => 'pending',
                        ]);

                        $created[] = $existingRegistration->fresh([
                            'course',
                            'resitPeriod',
                            'result',
                        ]);

                        continue;
                    }

                    abort(
                        422,
                        'You have already registered for ' .
                        $result->course->code . '.'
                    );
                }

                // Create a new registration if none exists.
                $registration = ResitRegistration::create([
                    'student_id' => $student->id,
                    'course_id' => $result->course_id,
                    'resit_period_id' => $period->id,
                    'result_id' => $result->id,
                    'payment_id' => null,
                    'status' => 'pending',
                ]);

                $created[] = $registration;
            }

            return $created;
        });

        return response()->json([
            'message' => 'Your resit course registrations were created successfully.',
            'registrations' => $registrations,
        ], 201);
    }


    /**
     * Cancel a pending registration.
     */
    public function destroy(Request $request, string $id)
    {
        $student = $request->user();

        $registration = ResitRegistration::where(
            'student_id',
            $student->id
        )->findOrFail($id);

        if ($registration->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending registrations can be cancelled.',
            ], 422);
        }

        if ($registration->payment_id !== null) {
            return response()->json([
                'message' => 'This registration is already linked to a payment and cannot be cancelled here.',
            ], 422);
        }

        $registration->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Resit registration cancelled successfully.',
        ]);
    }
}