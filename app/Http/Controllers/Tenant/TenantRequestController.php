<?php

namespace App\Http\Controllers\Tenant;

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

        $requests = TenantRequest::where('tenant_id', $user->id)
            ->with(['room', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Tenant/Requests/Index', [
            'requests' => $requests,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        // Get tenant's room info
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

        if (!$landlord) {
            return redirect()->route('tenant.dashboard')
                ->with('error', 'KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin chá»§ trá»!');
        }

        return Inertia::render('Tenant/Requests/Create', [
            'room' => $room,
            'landlord' => $landlord,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // Get landlord info
        $renterRequest = $user->renterRequest;
        if (!$renterRequest) {
            return back()->with('error', 'KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin thuÃª phÃ²ng!');
        }

        $contract = $renterRequest->contracts()
            ->where(function ($query) {
                $query->where('end_date', '>=', now())
                      ->orWhereNull('end_date');
            })
            ->with('room.house')
            ->first();

        if (!$contract) {
            return back()->with('error', 'KhÃ´ng tÃ¬m tháº¥y há»£p Ä‘á»“ng!');
        }

        $validated = $request->validate([
            'type' => 'required|in:maintenance,complaint,question,other',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        TenantRequest::create([
            'tenant_id' => $user->id,
            'landlord_id' => $contract->room->house->user_id,
            'room_id' => $contract->room_id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'pending',
        ]);

        return redirect()->route('tenant.dashboard')
            ->with('success', 'Yêu cầu đã được gửi!');
    }

    public function show(TenantRequest $tenantRequest)
    {
        $user = Auth::user();

        if ($tenantRequest->tenant_id != $user->id) {
            abort(403, 'Unauthorized');
        }

        $tenantRequest->load(['room', 'landlord']);

        return Inertia::render('Tenant/Requests/Show', [
            'request' => $tenantRequest,
        ]);
    }
}
