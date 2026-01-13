<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TenantRequest;
use App\Models\Contract;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get tenant's contract info
        $renterRequest = $user->renterRequest;
        $contract = null;
        $room = null;
        $landlord = null;

        if ($renterRequest) {
            $contract = $renterRequest->contracts()
                ->where(function ($query) {
                    $query->where('end_date', '>=', now())
                          ->orWhereNull('end_date');
                })
                ->with('room.house.user')
                ->first();

            if ($contract) {
                $room = $contract->room;
                $landlord = $contract->room->house->user;
            }
        }

        // Get recent requests
        $recentRequests = TenantRequest::where('tenant_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Count by status
        $requestsStats = [
            'pending' => TenantRequest::where('tenant_id', $user->id)->where('status', 'pending')->count(),
            'in_progress' => TenantRequest::where('tenant_id', $user->id)->where('status', 'in_progress')->count(),
            'resolved' => TenantRequest::where('tenant_id', $user->id)->where('status', 'resolved')->count(),
        ];

        return Inertia::render('Tenant/Dashboard', [
            'contract' => $contract,
            'room' => $room,
            'landlord' => $landlord,
            'recentRequests' => $recentRequests,
            'requestsStats' => $requestsStats,
        ]);
    }
}
