<?php

namespace App\Http\Middleware;

use App\Models\Student;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof Student) {
            return response()->json([
                'message' => 'Access denied. Students only.',
            ], 403);
        }

        return $next($request);
    }
}