<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>Resit Payment Receipt</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #263238;
            font-size: 12px;
            margin: 25px;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #c49a35;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }

        .school-name {
            font-size: 23px;
            font-weight: bold;
            color: #142d4e;
            margin-bottom: 5px;
        }

        .school-details {
            color: #666;
            font-size: 10px;
        }

        .receipt-title {
            text-align: center;
            font-size: 19px;
            font-weight: bold;
            color: #142d4e;
            margin: 25px 0;
        }

        .status {
            text-align: center;
            background: #e5f5e9;
            color: #18733a;
            padding: 10px;
            font-weight: bold;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .section-title {
            background: #142d4e;
            color: white;
            padding: 9px;
            font-weight: bold;
            margin-top: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        td, th {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        th {
            background: #f1f3f6;
            color: #142d4e;
        }

        .label {
            font-weight: bold;
            width: 35%;
            background: #f8f9fb;
        }

        .amount {
            font-size: 20px;
            font-weight: bold;
            color: #142d4e;
            text-align: right;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            color: #777;
            font-size: 10px;
        }
    </style>
</head>

<body>

    <div class="header">

        <div class="school-name">
            SUNYANI TECHNICAL UNIVERSITY
        </div>

        <div class="school-details">
            Official Resit Registration and Payment Receipt
        </div>

    </div>


    <div class="receipt-title">
        RESIT PAYMENT RECEIPT
    </div>


    <div class="status">
        PAYMENT SUCCESSFUL — PAID
    </div>


    <div class="section-title">
        RECEIPT INFORMATION
    </div>

    <table>

        <tr>
            <td class="label">Receipt Number</td>
            <td>{{ $receipt->receipt_number }}</td>
        </tr>

        <tr>
            <td class="label">Payment Reference</td>
            <td>{{ $payment->reference }}</td>
        </tr>

        <tr>
            <td class="label">Payment Date</td>
            <td>
                {{ $payment->paid_at ? $payment->paid_at->format('d M Y, h:i A') : 'N/A' }}
            </td>
        </tr>

        <tr>
            <td class="label">Payment Method</td>
            <td>{{ strtoupper(str_replace('_', ' ', $payment->method ?? 'N/A')) }}</td>
        </tr>

    </table>


    <div class="section-title">
        STUDENT INFORMATION
    </div>

    <table>

        <tr>
            <td class="label">Student Name</td>
            <td>
                {{ $payment->student->first_name }}
                {{ $payment->student->last_name }}
            </td>
        </tr>

        <tr>
            <td class="label">Index Number</td>
            <td>{{ $payment->student->index_number }}</td>
        </tr>

        <tr>
            <td class="label">Programme</td>
            <td>{{ $payment->student->programme ?? 'N/A' }}</td>
        </tr>

        <tr>
            <td class="label">Academic Year</td>
            <td>{{ $payment->resitPeriod->academic_year }}</td>
        </tr>

        <tr>
            <td class="label">Semester</td>
            <td>{{ $payment->resitPeriod->semester }}</td>
        </tr>

    </table>


    <div class="section-title">
        REGISTERED RESIT COURSES
    </div>

    <table>

        <thead>
            <tr>
                <th>No.</th>
                <th>Course Code</th>
                <th>Course Title</th>
            </tr>
        </thead>

        <tbody>

            @foreach($payment->resitRegistrations as $index => $registration)

                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $registration->course->code }}</td>
                    <td>{{ $registration->course->title }}</td>
                </tr>

            @endforeach

        </tbody>

    </table>


    <div class="amount">
        TOTAL PAID:
        {{ $payment->currency }}
        {{ number_format((float) $payment->amount, 2) }}
    </div>


    <div class="footer">

        This is an electronically generated payment receipt.

        <br><br>

        Thank you.

        <br>

        Please keep this receipt for your records.

    </div>

</body>
</html>