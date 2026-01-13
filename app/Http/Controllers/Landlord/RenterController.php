<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Renter;
use App\Models\Service;
use App\Models\RenterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * RenterController
 *
 * CRUD cho người thuê (Renter). Kiểm tra ràng buộc trước khi xóa
 * (không cho xóa nếu vẫn còn hợp đồng liên quan).
 */
class RenterController extends Controller
{
    public function index()
    {
        $renters = Renter::with('contracts')
            ->latest()
            ->get();

        return Inertia::render('Landlord/Renters/Index', [
            'renters' => $renters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Landlord/Renters/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255|unique:renters',
            'id_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        Renter::create($validated);

        return redirect()->route('landlord.renters.index')
                        ->with('success', 'Thêm người thuê thành công!');
    }

    public function show(Renter $renter)
    {
        $renter->load('contracts');
        
        return Inertia::render('Landlord/Renters/Show', [
            'renter' => $renter,
        ]);
    }

    public function edit(Renter $renter)
    {
        return Inertia::render('Landlord/Renters/Edit', [
            'renter' => $renter,
        ]);
    }

    public function update(Request $request, Renter $renter)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255|unique:renters,email,' . $renter->id,
            'id_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $renter->update($validated);

        return redirect()->route('landlord.renters.show', $renter->id)
                        ->with('success', 'Cập nhật người thuê thành công!');
    }

    public function destroy(Renter $renter)
    {
        // Kiểm tra nếu người thuê đang có hợp đồng (không được phép xóa)
        if ($renter->contracts()->exists()) {
            return redirect()->back()
                            ->with('error', 'Không thể xóa người thuê đang có hợp đồng!');
        }

        $renter->delete();

        return redirect()->route('landlord.renters.index')
                        ->with('success', 'Đã xóa người thuê');
    }

    /**
     * Show services for a specific renter
     */
    public function renterServices(Renter $renter)
    {
        $renter->load(['services']);
        $allServices = Service::where('is_active', true)->get();

        return Inertia::render('Landlord/Renters/RenterServices', [
            'renter' => $renter,
            'renterServices' => $renter->services,
            'allServices' => $allServices,
        ]);
    }

    /**
     * Attach service to renter
     */
    public function attachService(Request $request, Renter $renter)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Check if already exists
        $exists = RenterService::where('renter_id', $renter->id)
            ->where('service_id', $validated['service_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['service_id' => 'Dịch vụ này đã được thêm cho người thuê!']);
        }

        RenterService::create([
            'renter_id' => $renter->id,
            'service_id' => $validated['service_id'],
            'price' => $validated['price'],
            'note' => $validated['note'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Dịch vụ đã được thêm cho người thuê!');
    }

    /**
     * Update renter service
     */
    public function updateRenterService(Request $request, RenterService $renterService)
    {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'note' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $renterService->update($validated);

        return back()->with('success', 'Dịch vụ người thuê đã được cập nhật!');
    }

    /**
     * Detach service from renter
     */
    public function detachService(RenterService $renterService)
    {
        $renterService->delete();

        return back()->with('success', 'Dịch vụ đã được gỡ khỏi người thuê!');
    }
}
