<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Room;
use App\Models\Contract;
use App\Models\RenterRequest;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * DashboardController
 *
 * Tổng hợp các thống kê cho landlord/staff dashboard.
 * Staff chỉ thấy dữ liệu của các nhà được gán.
 */
class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Lấy danh sách house IDs mà user có quyền xem
        $houseIds = $user->getAccessibleHouseIds();

        // Get current month and year
        $currentMonth = Carbon::now()->month;
        $currentYear  = Carbon::now()->year;

        // Total Houses
        $totalHouses = House::whereIn('id', $houseIds)->count();

        if ($totalHouses === 0 && $user->role === 'landlord') {
            return redirect()->route('landlord.setup-wizard');
        }

        // Total Rooms
        $totalRooms = Room::whereIn('house_id', $houseIds)->count();

        // Occupied Rooms (rooms with active contracts)
        $occupiedRooms = Room::whereIn('house_id', $houseIds)
            ->whereHas('contracts', function ($q) {
                $q->where('status', 'active');
            })->count();

        // Vacant Rooms
        $vacantRooms = $totalRooms - $occupiedRooms;

        // Active Contracts
        $activeContracts = Contract::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })->where('status', 'active')->count();

        // Total Renters
        $totalRenters = RenterRequest::whereHas('contracts.room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })->where('status', 'approved')->distinct()->count();

        // Monthly Revenue Stats
        $monthlyBills = Bill::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })
        ->where('month', $currentMonth)
        ->where('year', $currentYear)
        ->get();

        $monthlyRevenue = $monthlyBills->sum('amount');

        // Previous month revenue
        $previousMonth = Carbon::now()->subMonth()->month;
        $previousYear  = Carbon::now()->subMonth()->year;

        $previousMonthRevenue = Bill::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })
        ->where('month', $previousMonth)
        ->where('year', $previousYear)
        ->sum('amount');

        // Revenue change percentage
        $revenueChangePercent    = 0;
        $revenueChangeIsPositive = true;

        if ($previousMonthRevenue > 0) {
            $revenueChangePercent    = round((($monthlyRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100, 1);
            $revenueChangeIsPositive = $revenueChangePercent >= 0;
            $revenueChangePercent    = abs($revenueChangePercent);
        } elseif ($monthlyRevenue > 0) {
            $revenueChangePercent    = 100;
            $revenueChangeIsPositive = true;
        }

        // Collected Amount (from payments)
        $collectedAmount = Payment::whereHas('bill.room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })
        ->whereHas('bill', function ($q) use ($currentMonth, $currentYear) {
            $q->where('month', $currentMonth)->where('year', $currentYear);
        })
        ->sum('amount');

        // Monthly pending amount
        $monthlyPending = $monthlyRevenue - $collectedAmount;

        // Collection Rate
        $collectionRate = $monthlyRevenue > 0 ? round(($collectedAmount / $monthlyRevenue) * 100, 1) : 0;

        // Total unpaid amount
        $totalUnpaidAmount = Bill::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })->whereIn('status', ['pending', 'partial'])->sum('amount');

        // Unpaid Bills Count
        $unpaidBills = Bill::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })->whereIn('status', ['pending', 'partial'])->count();

        // New Renter Requests
        $newRenterRequests = RenterRequest::whereHas('room', function ($q) use ($houseIds) {
            $q->whereIn('house_id', $houseIds);
        })->where('status', 'new')->count();

        // Revenue chart data for last 6 months
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $date    = Carbon::now()->subMonths($i);
            $month   = $date->month;
            $year    = $date->year;

            $revenue = Bill::whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->where('month', $month)
            ->where('year', $year)
            ->sum('amount');

            $collected = Payment::whereHas('bill.room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->whereHas('bill', function ($q) use ($month, $year) {
                $q->where('month', $month)->where('year', $year);
            })
            ->sum('amount');

            $revenueChart[] = [
                'month'     => $date->format('M'),
                'monthFull' => $date->format('F'),
                'revenue'   => $revenue,
                'collected' => $collected,
            ];
        }

        // Recent Contracts
        $contracts = Contract::with('room.house', 'renterRequest')
            ->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->paginate(6)
            ->through(function ($contract) {
                return [
                    'id'                 => $contract->id,
                    'room_id'            => $contract->room_id,
                    'renter_request_id'  => $contract->renter_request_id,
                    'start_date'         => $contract->start_date,
                    'end_date'           => $contract->end_date,
                    'monthly_rent'       => $contract->monthly_rent,
                    'deposit'            => $contract->deposit,
                    'payment_date'       => $contract->payment_date,
                    'status'             => $contract->status,
                    'room'               => $contract->room,
                    'renterRequest'      => $contract->renterRequest,
                ];
            });

        $stats = [
            'totalHouses'            => $totalHouses,
            'totalRooms'             => $totalRooms,
            'occupiedRooms'          => $occupiedRooms,
            'vacantRooms'            => $vacantRooms,
            'activeContracts'        => $activeContracts,
            'totalRenters'           => $totalRenters,
            'newRenterRequests'      => $newRenterRequests,
            'monthlyRevenue'         => $monthlyRevenue,
            'previousMonthRevenue'   => $previousMonthRevenue,
            'revenueChangePercent'   => $revenueChangePercent,
            'revenueChangeIsPositive'=> $revenueChangeIsPositive,
            'collectedAmount'        => $collectedAmount,
            'pendingAmount'          => $totalUnpaidAmount,
            'monthlyPending'         => $monthlyPending,
            'collectionRate'         => $collectionRate,
            'unpaidBills'            => $unpaidBills,
            'revenueChart'           => $revenueChart,
        ];

        return Inertia::render('Landlord/Dashboard', [
            'stats'     => $stats,
            'contracts' => $contracts,
        ]);
    }

    public function showWizard()
    {
        $user = auth()->user();
        if ($user->houses()->count() > 0) {
            return redirect()->route('landlord.dashboard');
        }

        $packages = \App\Models\Package::where('is_active', true)->orderBy('price', 'asc')->get();

        return Inertia::render('Landlord/SetupWizard', [
            'packages' => $packages,
        ]);
    }

    public function saveWizard(Request $request)
    {
        $user = auth()->user();
        if ($user->houses()->count() > 0) {
            return redirect()->route('landlord.dashboard');
        }

        // Tìm gói dịch vụ được chọn trước
        $packageId = $request->input('package_id');
        $package = \App\Models\Package::find($packageId);
        $roomLimit = $package ? (int) $package->room_limit : 5;

        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'house_name' => 'required|string|max:255',
            'house_address' => 'required|string|max:255',
            'room_count' => 'required|integer|min:1|max:' . $roomLimit,
            'room_rent_price' => 'required|numeric|min:0',
            'room_area' => 'nullable|numeric|min:0',
        ], [
            'package_id.required' => 'Vui lòng chọn một gói dịch vụ phần mềm.',
            'house_name.required' => 'Vui lòng nhập tên nhà trọ.',
            'house_address.required' => 'Vui lòng nhập địa chỉ nhà trọ.',
            'room_count.required' => 'Vui lòng nhập số lượng phòng.',
            'room_count.max' => 'Số lượng phòng tạo vượt quá hạn mức của gói dịch vụ bạn đã chọn (' . $roomLimit . ' phòng).',
            'room_rent_price.required' => 'Vui lòng nhập giá thuê phòng.',
        ]);

        // 1. Tạo Subscription cho gói cước đã chọn
        $startDate = \Carbon\Carbon::now();
        $endDate = $startDate->copy();
        $durationValue = $package->duration_value ?? 1;
        $durationType = $package->duration_type ?? 'month';
        
        if ($durationType === 'lifetime' || $durationType === 'onetime') {
            $endDate->addYears(100);
        } elseif ($durationType === 'week') {
            $endDate->addWeeks($durationValue);
        } elseif ($durationType === 'year') {
            $endDate->addYears($durationValue);
        } else {
            $endDate->addMonths($durationValue);
        }
        
        \App\Models\Subscription::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_paid' => $package->price,
            'status' => 'active',
            'payment_status' => 'paid',
        ]);

        // 2. Create the House
        $house = House::create([
            'user_id' => $user->id,
            'name' => $validated['house_name'],
            'address' => $validated['house_address'],
        ]);

        // 3. Create the Rooms (Chủ trọ sẽ tự tạo dịch vụ riêng sau khi vào Dashboard)
        $roomCount = $validated['room_count'];
        for ($i = 1; $i <= $roomCount; $i++) {
            $roomName = "Phòng " . (100 + $i);
            $room = $house->rooms()->create([
                'name' => $roomName,
                'price' => $validated['room_rent_price'],
                'status' => 'available',
                'floor' => 1,
                'area' => $validated['room_area'] ?? 20,
            ]);
        }

        return redirect()->route('landlord.dashboard')
            ->with('success', 'Chúc mừng! Bạn đã đăng ký thành công gói cước ' . $package->name . ' và thiết lập chuỗi nhà trọ thành công!');
    }
}
