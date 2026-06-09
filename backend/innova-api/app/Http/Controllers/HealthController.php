<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        try {
            DB::select('SELECT 1');

            return response()->json(['status' => 'ok', 'database' => 'up']);
        } catch (\Throwable) {
            return response()->json(['status' => 'degraded', 'database' => 'down'], 503);
        }
    }
}
