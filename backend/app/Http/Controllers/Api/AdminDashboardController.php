<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Student;
use App\Models\Course;
use App\Models\ResitRegistration;
use App\Models\Payment;

class AdminDashboardController extends Controller
{
    /**
     * Get administrator dashboard statistics.
     */
    public function index()
    {
        $totalStudents = Student::count();

        $totalCourses = Course::count();

        $totalRegistrations = ResitRegistration::where(
            'status',
            '!=',
            'cancelled'
        )->count();

        $totalPayments = Payment::where('status', 'paid')
            ->sum('amount');

        return response()->json([
            'message' => 'Dashboard statistics retrieved successfully.',

            'statistics' => [
                'total_students' => $totalStudents,
                'total_courses' => $totalCourses,
                'total_registrations' => $totalRegistrations,
                'total_payments' => (float) $totalPayments,
            ],
        ]);
    }


    /**
     * Get the five most recent resit registrations.
     */
    public function recentRegistrations()
    {
        $registrations = ResitRegistration::with([
            'student:id,index_number,first_name,last_name',
            'course:id,code,title',
        ])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'message' => 'Recent registrations retrieved successfully.',
            'registrations' => $registrations,
        ]);
    }


    /**
     * Get monthly resit registration statistics.
     */
    public function monthlyRegistrations(Request $request)
    {
        $year = $request->query('year', now()->year);

        if (
            !is_numeric($year) ||
            (int) $year < 2000 ||
            (int) $year > now()->year + 1
        ) {
            return response()->json([
                'message' => 'Please provide a valid year.',
            ], 422);
        }

        $year = (int) $year;

        $monthlyData = ResitRegistration::selectRaw(
            'EXTRACT(MONTH FROM created_at)::integer AS month, COUNT(*) AS total'
        )
            ->whereYear('created_at', $year)
            ->where('status', '!=', 'cancelled')
            ->groupByRaw('EXTRACT(MONTH FROM created_at)')
            ->orderByRaw('EXTRACT(MONTH FROM created_at)')
            ->pluck('total', 'month');

        $months = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'May',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Aug',
            9 => 'Sep',
            10 => 'Oct',
            11 => 'Nov',
            12 => 'Dec',
        ];

        $registrations = [];

        foreach ($months as $monthNumber => $monthName) {
            $registrations[] = [
                'month' => $monthName,
                'total' => (int) ($monthlyData[$monthNumber] ?? 0),
            ];
        }

        return response()->json([
            'message' => 'Monthly registration statistics retrieved successfully.',
            'year' => $year,
            'registrations' => $registrations,
        ]);
    }
}