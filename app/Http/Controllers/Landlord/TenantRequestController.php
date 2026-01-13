<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TenantRequest;

class TenantRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $requests = TenantRequest::where('landlord_id', $user->id)
            ->with(['tenant', 'room'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Landlord/TenantRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function show(TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->landlord_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        $tenantRequest->load(['tenant', 'room.house']);

        return Inertia::render('Landlord/TenantRequests/Show', [
            'request' => $tenantRequest,
        ]);
    }

    public function updateStatus(Request $request, TenantRequest $tenantRequest, $status)
    {
        $user = Auth::user();

        if ($tenantRequest->landlord_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        $validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];

        if (!in_array($status, $validStatuses)) {
            return redirect()->back()->with('error', 'Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡!');
        }

        $tenantRequest->update(['status' => $status]);

        return redirect()->back()->with('success', 'Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng!');
    }

    public function respond(Request $request, TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->landlord_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'response' => 'required|string',
        ]);

        $tenantRequest->update([
            'landlord_response' => $validated['response'],
            'responded_at' => now(),
            'status' => 'in_progress',
        ]);

        return redirect()->back()->with('success', 'ÄÃ£ gá»­i pháº£n há»“i!');
    }
}
