<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\StudentRowsImport;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class StudentImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls', 'max:5120'],
        ]);

        try {
            $import = new StudentRowsImport();

            Excel::import($import, $request->file('file'));

            $rows = $import->rows;

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Unable to read the uploaded file. Please check its format.',
            ], 422);
        }

        if ($rows->isEmpty()) {
            return response()->json([
                'message' => 'The uploaded file is empty.',
            ], 422);
        }

        $firstRow = $rows->first();

        $requiredColumns = [
            'index_number',
            'first_name',
            'last_name',
        ];

        foreach ($requiredColumns as $column) {
            if (!array_key_exists($column, $firstRow->toArray())) {
                return response()->json([
                    'message' => "Missing required column: {$column}",
                ], 422);
            }
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNumber = 1;

        foreach ($rows as $row) {
            $rowNumber++;

            $data = $row->toArray();

            // Convert text fields to strings.
            foreach ([
                'index_number',
                'first_name',
                'last_name',
                'email',
                'phone',
                'programme',
            ] as $field) {
                if (isset($data[$field])) {
                    $data[$field] = trim((string) $data[$field]);
                }
            }

            // Skip completely empty rows.
            if (empty(array_filter($data, fn ($value) => $value !== null && $value !== ''))) {
                continue;
            }

            $validator = Validator::make($data, [
                'index_number' => ['required', 'string', 'max:255'],
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:30'],
                'programme' => ['nullable', 'string', 'max:255'],
                'level' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                $skipped++;

                $errors[] = "Row {$rowNumber}: " .
                    implode(' ', $validator->errors()->all());

                continue;
            }

            if (Student::where('index_number', $data['index_number'])->exists()) {
                $skipped++;

                $errors[] = "Row {$rowNumber}: Student index number already exists.";

                continue;
            }

            if (!empty($data['email']) &&
                Student::where('email', $data['email'])->exists()) {
                $skipped++;

                $errors[] = "Row {$rowNumber}: Student email already exists.";

                continue;
            }

            Student::create([
                'index_number' => $data['index_number'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => !empty($data['email']) ? $data['email'] : null,
                'phone' => !empty($data['phone']) ? $data['phone'] : null,
                'programme' => !empty($data['programme']) ? $data['programme'] : null,
                'level' => !empty($data['level']) ? $data['level'] : null,
                'password' => null,
                'is_active' => true,
            ]);

            $imported++;
        }

        return response()->json([
            'message' => 'Student import completed.',
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }
}