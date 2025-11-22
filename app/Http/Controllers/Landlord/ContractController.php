<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Room;
use App\Models\Renter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function index(Room $room)
    {
        $contracts = $room->contracts()
            ->with('renter')
            ->latest()
            ->get();

        return Inertia::render('Landlord/Contracts/Index', [
            'room' => $room->load('house'),
            'contracts' => $contracts,
        ]);
    }

    public function create(Room $room)
    {
        $renters = Renter::select(['id', 'name', 'phone', 'email'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Landlord/Contracts/Create', [
            'room' => $room->load('house'),
            'renters' => $renters,
        ]);
    }

    public function store(Request $request, Room $room)
    {
        $validated = $request->validate([
            'renter_id' => 'required|exists:renters,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'terms' => 'nullable|string',
        ]);

        $validated['status'] = 'active';
        
        $contract = $room->contracts()->create($validated);

        // Cập nhật trạng thái phòng thành "occupied"
        $room->update(['status' => 'occupied']);

        return redirect()->route('landlord.rooms.contracts.show', [
            'room' => $room->id,
            'contract' => $contract->id,
        ])->with('success', 'Tạo hợp đồng thành công!');
    }

    public function show(Room $room, Contract $contract)
    {
        return Inertia::render('Landlord/Contracts/Show', [
            'room' => $room->load('house'),
            'contract' => $contract->load('renter'),
        ]);
    }

    public function edit(Room $room, Contract $contract)
    {
        $renters = Renter::select(['id', 'name', 'phone', 'email'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Landlord/Contracts/Edit', [
            'room' => $room->load('house'),
            'contract' => $contract->load('renter'),
            'renters' => $renters,
        ]);
    }

    public function update(Request $request, Room $room, Contract $contract)
    {
        // Nếu chỉ cập nhật status (chấm dứt)
        if ($request->has('status') && !$request->has('renter_id')) {
            $validated = $request->validate([
                'status' => 'required|in:active,terminated,expired',
            ]);

            $contract->update($validated);

            // Nếu hợp đồng kết thúc, cập nhật trạng thái phòng
            if ($validated['status'] !== 'active') {
                $room->update(['status' => 'available']);
            }

            return redirect()->route('landlord.rooms.contracts.show', [
                'room' => $room->id,
                'contract' => $contract->id,
            ])->with('success', 'Cập nhật hợp đồng thành công!');
        }

        // Cập nhật toàn bộ thông tin hợp đồng
        $validated = $request->validate([
            'renter_id' => 'required|exists:renters,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'status' => 'required|in:active,terminated,expired',
            'terms' => 'nullable|string',
        ]);

        $contract->update($validated);

        // Nếu hợp đồng kết thúc, cập nhật trạng thái phòng
        if ($validated['status'] !== 'active') {
            $room->update(['status' => 'available']);
        }

        return redirect()->route('landlord.rooms.contracts.show', [
            'room' => $room->id,
            'contract' => $contract->id,
        ])->with('success', 'Cập nhật hợp đồng thành công!');
    }

    public function destroy(Room $room, Contract $contract)
    {
        $contract->delete();
        
        // Kiểm tra nếu không còn hợp đồng active nào, cập nhật trạng thái phòng
        if (!$room->contracts()->where('status', 'active')->exists()) {
            $room->update(['status' => 'available']);
        }

        return redirect()->route('landlord.rooms.contracts.index', $room->id)
            ->with('success', 'Đã xóa hợp đồng');
    }
}