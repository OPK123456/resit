<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\ResitRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminPaymentController extends Controller
{
    /**
     * Display all student payments.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,paid,failed,rejected',
            'method' => 'sometimes|in:paystack,cash,bank_deposit,mobile_money',
            'search' => 'sometimes|string|max:100',
        ]);

        $payments = Payment::with([
            'student',
            'resitPeriod',
            'resitRegistrations.course',
            'receipt',
            'verifier',
        ])
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where(
                    'status',
                    $validated['status']
                )
            )
            ->when(
                $request->filled('method'),
                fn ($query) => $query->where(
                    'method',
                    $validated['method']
                )
            )
            ->when($request->filled('search'), function ($query) use ($validated) {
                $search = $validated['search'];

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('reference', 'ILIKE', "%{$search}%")
                        ->orWhereHas('student', function ($studentQuery) use ($search) {
                            $studentQuery
                                ->where('index_number', 'ILIKE', "%{$search}%")
                                ->orWhere('first_name', 'ILIKE', "%{$search}%")
                                ->orWhere('last_name', 'ILIKE', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'payments' => $payments,
        ]);
    }


    /**
     * Display a specific payment.
     */
    public function show(Payment $payment)
    {
        $payment->load([
            'student',
            'resitPeriod',
            'resitRegistrations.course',
            'receipt',
            'verifier',
        ]);

        return response()->json([
            'message' => 'Payment details retrieved successfully.',
            'payment' => $payment,
        ]);
    }


    /**
     * Confirm a manual payment.
     */
    public function confirm(Request $request, Payment $payment)
    {
        if ($payment->method === 'paystack') {
            return response()->json([
                'message' => 'Paystack payments must be verified directly with Paystack.',
            ], 422);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending payments can be confirmed.',
            ], 422);
        }

        $validated = $request->validate([
            'confirmation_note' => 'nullable|string|max:1000',
        ]);

        $admin = $request->user();

        $confirmedPayment = DB::transaction(function () use (
            $payment,
            $admin,
            $validated
        ) {

            $lockedPayment = Payment::where('id', $payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status !== 'pending') {
                abort(422, 'This payment has already been processed.');
            }

            $lockedPayment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'verified_by' => $admin->id,

                'gateway_response' => array_merge(
                    $lockedPayment->gateway_response ?? [],
                    [
                        'verification_method' => 'manual',
                        'confirmation_note' => $validated['confirmation_note'] ?? null,
                        'confirmed_by' => $admin->id,
                        'confirmed_at' => now()->toDateTimeString(),
                    ]
                ),
            ]);

            // Mark associated registrations as paid.
            ResitRegistration::where(
                'payment_id',
                $lockedPayment->id
            )->update([
                'status' => 'paid',
            ]);

            // Generate a receipt record only once.
            Receipt::firstOrCreate(
                [
                    'payment_id' => $lockedPayment->id,
                ],
                [
                    'receipt_number' => 'RCPT-' .
                        now()->format('Y') . '-' .
                        strtoupper(Str::random(10)),
                    'issued_at' => now(),
                ]
            );

            return $lockedPayment->load([
                'student',
                'resitPeriod',
                'resitRegistrations.course',
                'receipt',
                'verifier',
            ]);
        });

        return response()->json([
            'message' => 'Manual payment confirmed successfully.',
            'payment' => $confirmedPayment,
        ]);
    }


    /**
     * Reject a manual payment.
     */
    public function reject(Request $request, Payment $payment)
    {
        if ($payment->method === 'paystack') {
            return response()->json([
                'message' => 'Paystack payments cannot be rejected manually. Verify their status with Paystack.',
            ], 422);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending payments can be rejected.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $admin = $request->user();

        DB::transaction(function () use (
            $payment,
            $admin,
            $validated
        ) {

            $lockedPayment = Payment::where('id', $payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status !== 'pending') {
                abort(422, 'This payment has already been processed.');
            }

            $lockedPayment->update([
                'status' => 'failed',
                'verified_by' => $admin->id,

                'gateway_response' => array_merge(
                    $lockedPayment->gateway_response ?? [],
                    [
                        'verification_method' => 'manual',
                        'rejection_reason' => $validated['reason'],
                        'rejected_by' => $admin->id,
                        'rejected_at' => now()->toDateTimeString(),
                    ]
                ),
            ]);

            // Release registrations so the student can try again.
            ResitRegistration::where(
                'payment_id',
                $lockedPayment->id
            )
                ->where('status', 'pending')
                ->update([
                    'payment_id' => null,
                ]);
        });

        return response()->json([
            'message' => 'Manual payment rejected successfully.',
        ]);
    }
}