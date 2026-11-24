<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Download a student's payment receipt as PDF.
     */
    public function download(Request $request, Payment $payment)
    {
        // Ensure the payment belongs to the logged-in student.
        abort_unless(
            $payment->student_id === $request->user()->id,
            404
        );

        // Only successful payments can have receipts.
        if ($payment->status !== 'paid') {
            return response()->json([
                'message' => 'A receipt is only available after successful payment confirmation.',
            ], 422);
        }

        // Load payment details and relationships.
        $payment->load([
            'student',
            'resitPeriod',
            'resitRegistrations.course',
            'receipt',
        ]);

        // Check that a receipt record exists.
        if (!$payment->receipt) {
            return response()->json([
                'message' => 'The receipt has not been generated yet.',
            ], 404);
        }

        // Generate the PDF.
        $pdf = Pdf::loadView('receipts.payment', [
            'payment' => $payment,
            'receipt' => $payment->receipt,
        ])->setPaper('A4', 'portrait');

        // Download the PDF.
        return $pdf->download(
            'receipt-' . $payment->receipt->receipt_number . '.pdf'
        );
    }
}
