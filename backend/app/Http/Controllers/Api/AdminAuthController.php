<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * Administrator login.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $validated['email'])->first();

        if (
            !$admin ||
            !$admin->is_active ||
            !Hash::check($validated['password'], $admin->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['The provided login details are incorrect.'],
            ]);
        }

        $token = $admin->createToken('admin-portal')->plainTextToken;

        return response()->json([
            'message' => 'Administrator login successful.',
            'admin' => $admin,
            'token' => $token,
        ]);
    }

    /**
     * Administrator logout.
     */
    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated administrator.
     */
    public function me(Request $request)
    {
        $admin = $request->user();

        return response()->json([
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
            'message' => 'Administrator authenticated successfully.',
        ]);
    }
}