<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Course;
use App\Models\Result;
use Illuminate\Http\Request;

class ResultImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = fopen($request->file('file')->getRealPath(), 'r');

        if (!$file) {
            return response()->json([
                'message' => 'Unable to read the uploaded file.',
            ], 422);
        }

        $headers = fgetcsv($file);

        if (!$headers) {
            fclose($file);

            return response()->json([
                'message' => 'The CSV file is empty.',
            ], 422);
        }

        // Clean column headings.
        $headers = array_map(function ($header) {
            return strtolower(trim($header));
        }, $headers);

        $requiredColumns = [
            'index_number',
            'course_code',
            'academic_year',
            'semester',
            'score',
        ];

        foreach ($requiredColumns as $column) {
            if (!in_array($column, $headers)) {
                fclose($file);

                return response()->json([
                    'message' => "Missing required column: {$column}",
                ], 422);
            }
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($file)) !== false) {
            $rowNumber++;

            if (count($row) !== count($headers)) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Incorrect number of columns.";
                continue;
            }

            $data = array_combine($headers, $row);

            $indexNumber = trim($data['index_number']);
            $courseCode = trim($data['course_code']);
            $academicYear = trim($data['academic_year']);
            $semester = trim($data['semester']);
            $score = trim($data['score']);

            $student = Student::where('index_number', $indexNumber)->first();

            $course = Course::where('code', $courseCode)->first();

            if (!$student) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Student {$indexNumber} was not found.";
                continue;
            }

            if (!$course) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Course {$courseCode} was not found.";
                continue;
            }

            if (!is_numeric($score) || $score < 0 || $score > 100) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Invalid score.";
                continue;
            }

            $existingResult = Result::where('student_id', $student->id)
                ->where('course_id', $course->id)
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
                ->exists();

            if ($existingResult) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: This result already exists.";
                continue;
            }

            Result::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'score' => $score,
                'grade' => $data['grade'] ?? null,
                'is_resit_eligible' => $score < 50,
                'imported_by' => $request->user()->id,
            ]);

            $imported++;
        }

        fclose($file);

        return response()->json([
            'message' => 'Result import completed.',
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }
}