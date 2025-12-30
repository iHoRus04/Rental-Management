<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Room;
use App\Models\RenterRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function index(Room $room)
    {
        $contracts = $room->contracts()
            ->with('renterRequest')
            ->latest()
            ->get()
            ->map(function($contract) {
                return [
                    'id' => $contract->id,
                    'room_id' => $contract->room_id,
                    'renter_request_id' => $contract->renter_request_id,
                    'start_date' => $contract->start_date,
                    'end_date' => $contract->end_date,
                    'monthly_rent' => $contract->monthly_rent,
                    'deposit' => $contract->deposit,
                    'payment_date' => $contract->payment_date,
                    'status' => $contract->status,
                    'renterRequest' => $contract->renterRequest,
                ];
            });

        return Inertia::render('Landlord/Contracts/Index', [
            'room' => $room->load('house'),
            'contracts' => $contracts,
        ]);
    }

    public function create(Room $room)
    {
        // Lấy danh sách RenterRequest của phòng này với trạng thái 'approved'
        $renterRequests = RenterRequest::where('room_id', $room->id)
            ->where('status', 'approved')
            ->select(['id', 'name', 'phone', 'email', 'status'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Landlord/Contracts/Create', [
            'room' => $room->load('house'),
            'renterRequests' => $renterRequests,
        ]);
    }

    public function store(Request $request, Room $room)
    {
        $validated = $request->validate([
            'renter_request_id' => 'required|exists:renter_requests,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'terms' => 'nullable|string',
        ]);

        // Lấy RenterRequest data
        $renterRequest = RenterRequest::find($validated['renter_request_id']);
        
        // Cập nhật trạng thái RenterRequest thành 'approved'
        $renterRequest->update(['status' => 'approved']);
        
        $validated['status'] = 'active';
        
        $contract = $room->contracts()->create($validated);

        // Cập nhật trạng thái phòng thành "occupied"
        $room->update(['status' => 'occupied']);

        // Load relationship before redirect
        $contract->load('renterRequest');

        return redirect()->route('landlord.rooms.contracts.show', [
            'room' => $room->id,
            'contract' => $contract->id,
        ])->with('success', 'Tạo hợp đồng thành công!');
    }

    public function show(Room $room, Contract $contract)
    {
        $contract->load('renterRequest');
        
        $contractData = [
            'id' => $contract->id,
            'room_id' => $contract->room_id,
            'renter_request_id' => $contract->renter_request_id,
            'start_date' => $contract->start_date,
            'end_date' => $contract->end_date,
            'monthly_rent' => $contract->monthly_rent,
            'deposit' => $contract->deposit,
            'payment_date' => $contract->payment_date,
            'status' => $contract->status,
            'terms' => $contract->terms,
            'renterRequest' => $contract->renterRequest,
        ];
        
        return Inertia::render('Landlord/Contracts/Show', [
            'room' => $room->load('house'),
            'contract' => $contractData,
        ]);
    }

    public function edit(Room $room, Contract $contract)
    {
        $renterRequests = RenterRequest::select(['id', 'name', 'phone', 'email'])
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        return Inertia::render('Landlord/Contracts/Edit', [
            'room' => $room->load('house'),
            'contract' => $contract->load('renterRequest'),
            'renterRequests' => $renterRequests,
        ]);
    }

    public function update(Request $request, Room $room, Contract $contract)
    {
        // Nếu chỉ cập nhật status (chấm dứt)
        if ($request->has('status') && !$request->has('renter_request_id')) {
            $validated = $request->validate([
                'status' => 'required|in:active,terminated,expired',
            ]);

            $contract->update($validated);

            // Cập nhật trạng thái phòng dựa trên status hợp đồng
            if ($validated['status'] === 'active') {
                $room->update(['status' => 'occupied']);
            } else {
                $room->update(['status' => 'available']);
            }

            return redirect()->route('landlord.rooms.contracts.show', [
                'room' => $room->id,
                'contract' => $contract->id,
            ])->with('success', 'Cập nhật hợp đồng thành công!');
        }

        // Cập nhật toàn bộ thông tin hợp đồng
        $validated = $request->validate([
            'renter_request_id' => 'required|exists:renter_requests,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'payment_date' => 'required|integer|min:1|max:31',
            'status' => 'required|in:active,terminated,expired',
            'terms' => 'nullable|string',
        ]);

        $contract->update($validated);

        // Cập nhật trạng thái phòng dựa trên status hợp đồng
        if ($validated['status'] === 'active') {
            $room->update(['status' => 'occupied']);
        } else {
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