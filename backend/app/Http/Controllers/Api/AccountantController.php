<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AccountantController extends Controller
{
    /**
     * Get accountant dashboard data.
     */
    public function dashboard(Request $request)
    {
        // TODO: Implement accountant dashboard logic
        return response()->json([
            'status' => true,
            'message' => 'Accountant dashboard data',
            'data' => [
                'total_payments' => 0,
                'pending_payments' => 0,
                'successful_payments' => 0,
                'recent_payments' => []
            ]
        ]);
    }
}
