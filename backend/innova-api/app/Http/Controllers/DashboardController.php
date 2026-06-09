<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboard) {}

    public function getAdminDashboard(): JsonResponse
    {
        return response()->json($this->dashboard->buildAdminDashboard());
    }

    public function getGerenteDashboard(): JsonResponse
    {
        return response()->json($this->dashboard->buildGerenteDashboard());
    }
}
