<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\ResitPeriod;
use App\Models\ResitRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentController extends Controller
{
    /**
     * Display the student's payment history.
     */
    public function index(Request $request)
    {
        $student = $request->user();

        $payments = Payment::with([
            'resitPeriod',
            'resitRegistrations.course',
            'receipt',
        ])
            ->where('student_id', $student->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Payment history retrieved successfully.',
            'payments' => $payments,
        ]);
    }


    /**
     * Create a payment for selected resit registrations.
     */
    public function store(Request $request)
    {
        $student = $request->user();

        $validated = $request->validate([
            'resit_period_id' => 'required|exists:resit_periods,id',

            'registration_ids' => 'required|array|min:1|max:20',

            'registration_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:resit_registrations,id',
            ],

            'method' => 'required|in:paystack,cash,bank_deposit,mobile_money',
        ]);

        // Paystack requires a secret key and customer email.
        if ($validated['method'] === 'paystack') {

            if (!config('services.paystack.secret_key')) {
                return response()->json([
                    'message' => 'Paystack has not been configured yet. Please contact the school administrator.',
                ], 503);
            }

            if (!$student->email) {
                return response()->json([
                    'message' => 'A registered email address is required for online payment.',
                ], 422);
            }
        }

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
                'message' => 'This resit period is currently closed.',
            ], 422);
        }

        try {

            $payment = DB::transaction(function () use (
                $student,
                $period,
                $validated
            ) {

                $registrations = ResitRegistration::where(
                    'student_id',
                    $student->id
                )
                    ->where('resit_period_id', $period->id)
                    ->where('status', 'pending')
                    ->whereNull('payment_id')
                    ->whereIn('id', $validated['registration_ids'])
                    ->lockForUpdate()
                    ->get();

                if (
                    $registrations->count() !==
                    count($validated['registration_ids'])
                ) {
                    abort(
                        422,
                        'One or more selected registrations are invalid, already paid, or linked to another payment.'
                    );
                }

                // Calculate the amount using the resit period fee.
                $numberOfCourses = $registrations->count();

                $feeInPesewas = (int) round(
                    (float) $period->fee_per_course * 100
                );

                $totalInPesewas = $feeInPesewas * $numberOfCourses;

                $amount = number_format(
                    $totalInPesewas / 100,
                    2,
                    '.',
                    ''
                );

                // Generate a unique payment reference.
                do {
                    $reference = 'RSIT-' .
                        now()->format('Y') . '-' .
                        strtoupper(Str::random(12));

                } while (
                    Payment::where('reference', $reference)->exists()
                );

                // Create the pending payment.
                $payment = Payment::create([
                    'student_id' => $student->id,
                    'resit_period_id' => $period->id,
                    'amount' => $amount,
                    'currency' => 'GHS',
                    'reference' => $reference,
                    'method' => $validated['method'],
                    'status' => 'pending',
                ]);

                // Link registrations to the payment.
                foreach ($registrations as $registration) {
                    $registration->update([
                        'payment_id' => $payment->id,
                    ]);
                }

                return $payment->load('resitRegistrations.course');
            });

            // Manual payments await administrator verification.
            if ($payment->method !== 'paystack') {

                return response()->json([
                    'message' => 'Payment record created successfully. Awaiting administrator verification.',

                    'payment' => [
                        'id' => $payment->id,
                        'reference' => $payment->reference,
                        'amount' => $payment->amount,
                        'currency' => $payment->currency,
                        'method' => $payment->method,
                        'status' => $payment->status,
                        'number_of_courses' => $payment->resitRegistrations->count(),
                    ],
                ], 201);
            }

            // Convert Ghana cedis to pesewas.
            $amountInPesewas = (int) round(
                (float) $payment->amount * 100
            );

            // Initialize the transaction with Paystack.
            $paystackResponse = Http::withToken(
                config('services.paystack.secret_key')
            )
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(30)
                ->post(
                    rtrim(config('services.paystack.payment_url'), '/') .
                    '/transaction/initialize',
                    [
                        'email' => $student->email,
                        'amount' => $amountInPesewas,
                        'currency' => 'GHS',
                        'reference' => $payment->reference,

                        'metadata' => [
                            'payment_id' => $payment->id,
                            'student_id' => $student->id,
                        ],
                    ]
                );

            if (
                !$paystackResponse->successful() ||
                !$paystackResponse->json('status') ||
                !$paystackResponse->json('data.authorization_url')
            ) {

                DB::transaction(function () use ($payment) {

                    $payment->update([
                        'status' => 'failed',
                        'gateway_response' => [
                            'message' => 'Paystack transaction initialization failed.',
                        ],
                    ]);

                    ResitRegistration::where(
                        'payment_id',
                        $payment->id
                    )->update([
                        'payment_id' => null,
                    ]);
                });

                return response()->json([
                    'message' => 'Unable to initialize Paystack payment. Please try again.',
                ], 502);
            }

            // Save Paystack initialization details.
            $payment->update([
                'gateway_response' => [
                    'authorization_url' => $paystackResponse->json(
                        'data.authorization_url'
                    ),
                    'access_code' => $paystackResponse->json(
                        'data.access_code'
                    ),
                    'reference' => $paystackResponse->json(
                        'data.reference'
                    ),
                ],
            ]);

            return response()->json([
                'message' => 'Paystack payment initialized successfully.',

                'payment' => [
                    'id' => $payment->id,
                    'reference' => $payment->reference,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'method' => $payment->method,
                    'status' => $payment->status,
                    'authorization_url' => $paystackResponse->json(
                        'data.authorization_url'
                    ),
                ],

            ], 201);

        } catch (HttpException $exception) {

            return response()->json([
                'message' => $exception->getMessage(),
            ], $exception->getStatusCode());

        } catch (\Illuminate\Http\Client\ConnectionException $exception) {

            return response()->json([
                'message' => 'Unable to connect to Paystack. Please try again later. Your payment record remains pending until its status can be verified.',
            ], 503);
        }
    }


    /**
     * Verify a Paystack transaction when the student returns.
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:100',
        ]);

        $student = $request->user();

        $payment = Payment::where('reference', $validated['reference'])
            ->where('student_id', $student->id)
            ->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        if ($payment->method !== 'paystack') {
            return response()->json([
                'message' => 'This payment was not made through Paystack.',
            ], 422);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'This payment has already been confirmed.',
                'payment' => $payment->load('receipt'),
            ]);
        }

        $transaction = $this->verifyWithPaystack(
            $payment->reference
        );

        if (!$transaction) {
            return response()->json([
                'message' => 'Unable to verify this transaction with Paystack.',
            ], 502);
        }

        if (!$this->transactionMatchesPayment($payment, $transaction)) {
            return response()->json([
                'message' => 'The Paystack transaction details do not match the payment record.',
            ], 422);
        }

        if (($transaction['status'] ?? null) !== 'success') {
            return response()->json([
                'message' => 'Paystack has not confirmed this payment as successful.',
                'payment_status' => $transaction['status'] ?? 'unknown',
            ], 422);
        }

        $confirmedPayment = $this->markPaymentAsPaid(
            $payment,
            $transaction
        );

        return response()->json([
            'message' => 'Payment successfully verified and confirmed.',
            'payment' => $confirmedPayment,
        ]);
    }


    /**
     * Receive Paystack webhook notifications.
     */
    public function webhook(Request $request)
    {
        // Always verify the signature against the original raw request body.
        $rawBody = $request->getContent();

        if (!$this->verifyWebhookSignature($request, $rawBody)) {
            return response()->json([
                'message' => 'Invalid Paystack webhook signature.',
            ], 401);
        }

        $event = json_decode($rawBody, true);

        if (!is_array($event)) {
            return response()->json([
                'message' => 'Invalid webhook payload.',
            ], 400);
        }

        // Acknowledge events that this application does not process.
        if (($event['event'] ?? null) !== 'charge.success') {
            return response()->json([
                'message' => 'Webhook received.',
            ], 200);
        }

        $reference = $event['data']['reference'] ?? null;

        if (!$reference) {
            return response()->json([
                'message' => 'Webhook received but no reference was supplied.',
            ], 200);
        }

        $payment = Payment::where('reference', $reference)
            ->where('method', 'paystack')
            ->first();

        // Acknowledge unrelated transactions without processing them.
        if (!$payment) {
            return response()->json([
                'message' => 'No matching payment record.',
            ], 200);
        }

        // Duplicate notifications must not create duplicate receipts.
        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already confirmed.',
            ], 200);
        }

        try {

            // Verify directly with Paystack instead of trusting the
            // webhook payload alone.
            $transaction = $this->verifyWithPaystack(
                $payment->reference
            );

            if (!$transaction) {
                return response()->json([
                    'message' => 'Unable to verify the transaction.',
                ], 503);
            }

            if (
                ($transaction['status'] ?? null) !== 'success' ||
                !$this->transactionMatchesPayment($payment, $transaction)
            ) {
                return response()->json([
                    'message' => 'Transaction verification failed.',
                ], 422);
            }

            $this->markPaymentAsPaid(
                $payment,
                $transaction
            );

            return response()->json([
                'message' => 'Paystack payment webhook processed successfully.',
            ], 200);

        } catch (\Illuminate\Http\Client\ConnectionException $exception) {

            return response()->json([
                'message' => 'Unable to connect to Paystack.',
            ], 503);
        }
    }


    /**
     * Verify a webhook signature.
     *
     * Supports the newer Paystack-Signature header and
     * the legacy x-paystack-signature header.
     */
    private function verifyWebhookSignature(
        Request $request,
        string $rawBody
    ): bool {

        $modernSignature = $request->header('Paystack-Signature');

        // New Paystack signing-secret format.
        if ($modernSignature) {

            $signingSecret = config(
                'services.paystack.webhook_secret'
            );

            if (!$signingSecret) {
                return false;
            }

            $timestamp = null;
            $signatures = [];

            foreach (explode(',', $modernSignature) as $part) {

                $parts = explode('=', trim($part), 2);

                if (count($parts) !== 2) {
                    continue;
                }

                $key = trim($parts[0]);
                $value = trim($parts[1]);

                if ($key === 't') {
                    $timestamp = $value;
                }

                if ($key === 'v1') {
                    $signatures[] = $value;
                }
            }

            if (
                !$timestamp ||
                !ctype_digit($timestamp) ||
                empty($signatures)
            ) {
                return false;
            }

            // Reject webhook timestamps older or newer than five minutes.
            if (abs(time() - (int) $timestamp) > 300) {
                return false;
            }

            $expectedSignature = hash_hmac(
                'sha512',
                $timestamp . '.' . $rawBody,
                $signingSecret
            );

            foreach ($signatures as $signature) {

                $signatureParts = explode(':', $signature, 2);

                if (count($signatureParts) !== 2) {
                    continue;
                }

                $receivedSignature = $signatureParts[1];

                if (
                    preg_match('/^[a-f0-9]{128}$/i', $receivedSignature) &&
                    hash_equals(
                        $expectedSignature,
                        strtolower($receivedSignature)
                    )
                ) {
                    return true;
                }
            }

            return false;
        }

        // Legacy Paystack signature format.
        $legacySignature = $request->header(
            'x-paystack-signature'
        );

        $secretKey = config('services.paystack.secret_key');

        if (!$legacySignature || !$secretKey) {
            return false;
        }

        $expectedSignature = hash_hmac(
            'sha512',
            $rawBody,
            $secretKey
        );

        return hash_equals(
            $expectedSignature,
            $legacySignature
        );
    }


    /**
     * Verify a transaction directly with Paystack.
     */
    private function verifyWithPaystack(string $reference): ?array
    {
        $secretKey = config('services.paystack.secret_key');

        $paymentUrl = config('services.paystack.payment_url');

        // Ensure Paystack credentials are configured.
        if (!$secretKey || !$paymentUrl) {
            return null;
        }

        try {

            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(30)
                ->get(
                    rtrim($paymentUrl, '/') .
                    '/transaction/verify/' .
                    rawurlencode($reference)
                );

            // Check whether Paystack returned a successful response.
            if (
                !$response->successful() ||
                !$response->json('status')
            ) {
                return null;
            }

            $transaction = $response->json('data');

            // Return transaction details only when valid.
            return is_array($transaction)
                ? $transaction
                : null;

        } catch (\Illuminate\Http\Client\ConnectionException $exception) {

            // Paystack is temporarily unreachable.
            return null;
        }
    }


    /**
     * Check that Paystack transaction details match our payment.
     */
    private function transactionMatchesPayment(
        Payment $payment,
        array $transaction
    ): bool {

        $expectedAmount = (int) round(
            (float) $payment->amount * 100
        );

        return
            ($transaction['reference'] ?? null) === $payment->reference
            &&
            (int) ($transaction['amount'] ?? 0) === $expectedAmount
            &&
            ($transaction['currency'] ?? null) === 'GHS';
    }


    /**
     * Mark a payment and its registrations as paid.
     * Create a receipt record only once.
     */
    private function markPaymentAsPaid(
        Payment $payment,
        array $transaction
    ): Payment {

        return DB::transaction(function () use (
            $payment,
            $transaction
        ) {

            $lockedPayment = Payment::where('id', $payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Prevent duplicate processing.
            if ($lockedPayment->status === 'paid') {
                return $lockedPayment->load('receipt');
            }

            $lockedPayment->update([
                'status' => 'paid',
                'paid_at' => $transaction['paid_at'] ?? now(),

                'gateway_response' => array_merge(
                    $lockedPayment->gateway_response ?? [],
                    [
                        'verification_status' => $transaction['status'],
                        'verified_reference' => $transaction['reference'],
                        'verified_amount' => $transaction['amount'],
                        'verified_currency' => $transaction['currency'],
                        'channel' => $transaction['channel'] ?? null,
                    ]
                ),
            ]);

            // Mark all linked registrations as paid.
            ResitRegistration::where(
                'payment_id',
                $lockedPayment->id
            )->update([
                'status' => 'paid',
            ]);

            // Create one receipt record per payment.
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

            return $lockedPayment->load('receipt');
        });
    }
}