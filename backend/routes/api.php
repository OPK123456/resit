<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\StudentAuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentImportController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\ResultImportController;
use App\Http\Controllers\Api\ResitPeriodController;
use App\Http\Controllers\Api\StudentResitRegistrationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AdminPaymentController;
use App\Http\Controllers\Api\ReceiptController;


// ==========================================
// STUDENT AUTHENTICATION
// ==========================================

Route::prefix('student')->group(function () {

    Route::post('/activate', [StudentAuthController::class, 'activate'])
        ->middleware('throttle:5,1');

    Route::post('/login', [StudentAuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'student'])->group(function () {

        Route::post('/logout', [StudentAuthController::class, 'logout']);

        Route::get(
            '/resit-registrations',
            [StudentResitRegistrationController::class, 'index']
        );

        Route::get(
            '/eligible-courses',
            [StudentResitRegistrationController::class, 'eligibleCourses']
        );

        Route::post(
            '/resit-registrations',
            [StudentResitRegistrationController::class, 'store']
        );

        Route::delete(
            '/resit-registrations/{id}',
            [StudentResitRegistrationController::class, 'destroy']
        );

        Route::post('/payments', [PaymentController::class, 'store']);

        Route::get('/payments', [PaymentController::class, 'index']);

        Route::post('/payments/verify', [PaymentController::class, 'verify']);

        Route::get(
            '/payments/{payment}/receipt',
            [ReceiptController::class, 'download']
        );

    });

});


// ==========================================
// ADMINISTRATOR AUTHENTICATION
// ==========================================

Route::prefix('admin')->group(function () {

    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {

        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/me', [AdminAuthController::class, 'me']);

    });

});


// ==========================================
// ADMINISTRATOR MANAGEMENT
// ==========================================

Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        // ======================================
        // ADMIN DASHBOARD
        // ======================================

        Route::get(
            '/dashboard',
            [AdminDashboardController::class, 'index']
        );

        Route::get(
            '/dashboard/recent-registrations',
            [AdminDashboardController::class, 'recentRegistrations']
        );

        Route::get(
            '/dashboard/monthly-registrations',
            [AdminDashboardController::class, 'monthlyRegistrations']
        );


        // ======================================
        // STUDENT MANAGEMENT
        // ======================================

        Route::post(
            '/students/import',
            [StudentImportController::class, 'import']
        );

        Route::apiResource('students', StudentController::class);

        Route::post(
            '/students/{student}/activation-code',
            [StudentController::class, 'issueActivationCode']
        );


        // ======================================
        // COURSE MANAGEMENT
        // ======================================

        Route::apiResource('courses', CourseController::class);


        // ======================================
        // RESIT PERIOD MANAGEMENT
        // ======================================

        Route::apiResource('resit-periods', ResitPeriodController::class);


        // ======================================
        // EXAMINATION RESULTS MANAGEMENT
        // ======================================

        Route::post(
            '/results/import',
            [ResultImportController::class, 'import']
        );

        Route::apiResource('results', ResultController::class);


        // ======================================
        // ADMINISTRATOR PAYMENT MANAGEMENT
        // ======================================

        Route::get('/payments', [AdminPaymentController::class, 'index']);

        Route::get(
            '/payments/{payment}',
            [AdminPaymentController::class, 'show']
        );

        Route::post(
            '/payments/{payment}/confirm',
            [AdminPaymentController::class, 'confirm']
        );

        Route::post(
            '/payments/{payment}/reject',
            [AdminPaymentController::class, 'reject']
        );

    });


// ==========================================
// PAYSTACK WEBHOOK
// ==========================================

Route::post(
    '/paystack/webhook',
    [PaymentController::class, 'webhook']
);