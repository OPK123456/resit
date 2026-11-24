<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResitPeriod;
use App\Models\ResitRegistration;
use Illuminate\Http\Request;

class ResitPeriodController extends Controller
{
    // Display all resit periods
    public function index()
    {
        $periods = ResitPeriod::latest()->paginate(20);

        return response()->json($periods);
    }


    // Create a new resit period
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'semester' => 'required|integer|min:1|max:2',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'fee_per_course' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_active'] = $validated['is_active'] ?? false;

        $period = ResitPeriod::create($validated);

        return response()->json([
            'message' => 'Resit period created successfully.',
            'period' => $period,
        ], 201);
    }


    // Display one resit period
    public function show(ResitPeriod $resitPeriod)
    {
        return response()->json($resitPeriod);
    }


    // Update a resit period
    public function update(Request $request, ResitPeriod $resitPeriod)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'academic_year' => 'sometimes|required|string|max:20',
            'semester' => 'sometimes|required|integer|min:1|max:2',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'fee_per_course' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate the end date against the existing start date
        $startDate = $validated['start_date'] ?? $resitPeriod->start_date;
        $endDate = $validated['end_date'] ?? $resitPeriod->end_date;

        if ($endDate < $startDate) {
            return response()->json([
                'message' => 'The end date cannot be before the start date.',
            ], 422);
        }

        $resitPeriod->update($validated);

        return response()->json([
            'message' => 'Resit period updated successfully.',
            'period' => $resitPeriod,
        ]);
    }


    // Delete a resit period
    public function destroy(ResitPeriod $resitPeriod)
    {
        $hasRegistrations = ResitRegistration::where(
            'resit_period_id',
            $resitPeriod->id
        )->exists();

        if ($hasRegistrations) {
            return response()->json([
                'message' => 'This resit period cannot be deleted because registrations already exist.',
            ], 422);
        }

        $resitPeriod->delete();

        return response()->json([
            'message' => 'Resit period deleted successfully.',
        ]);
    }
}