<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Renter;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        // Kiểm tra xem người thuê có hợp đồng không
        if ($renter->contracts()->exists()) {
            return redirect()->back()
                            ->with('error', 'Không thể xóa người thuê đang có hợp đồng!');
        }

        $renter->delete();

        return redirect()->route('landlord.renters.index')
                        ->with('success', 'Đã xóa người thuê');
    }
}
