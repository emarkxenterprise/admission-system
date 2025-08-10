<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('api/*')) {
            // For API requests, do not redirect, just return null (will return 401)
            return null;
        }
        // For web requests, redirect to a frontend login page or home
        return '/'; // or your SPA entry point
    }
}
