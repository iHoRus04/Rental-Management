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
 * Tổng hợp các thống kê cho landlord dashboard:
 * - Số nhà, phòng, hợp đồng, người thuê
 * - Doanh thu tháng, phần trăm so với tháng trước
 * - Tỉ lệ thu, khoản đang chờ thu và biểu đồ doanh thu 6 tháng
 */
class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get current month and year
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Total Houses
        $totalHouses = House::where('user_id', $user->id)->count();

        // Total Rooms
        $totalRooms = Room::whereHas('house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        // Occupied Rooms (rooms with active contracts)
        $occupiedRooms = Room::whereHas('house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->whereHas('contracts', function ($q) {
            $q->where('status', 'active');
        })->count();

        // Vacant Rooms
        $vacantRooms = $totalRooms - $occupiedRooms;

        // Active Contracts
        $activeContracts = Contract::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'active')->count();

        // Total Renters (now counting active RenterRequests with contracts)
        $totalRenters = RenterRequest::whereHas('contracts.room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'approved')->distinct()->count();

        // Monthly Revenue Stats
        $monthlyBills = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('month', $currentMonth)
        ->where('year', $currentYear)
        ->get();

        $monthlyRevenue = $monthlyBills->sum('amount');

        // Previous month revenue for comparison
        $previousMonth = Carbon::now()->subMonth()->month;
        $previousYear = Carbon::now()->subMonth()->year;
        
        $previousMonthRevenue = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('month', $previousMonth)
        ->where('year', $previousYear)
        ->sum('amount');

        // Revenue change percentage
        $revenueChangePercent = 0;
        $revenueChangeIsPositive = true;
        
        if ($previousMonthRevenue > 0) {
            $revenueChangePercent = round((($monthlyRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100, 1);
            $revenueChangeIsPositive = $revenueChangePercent >= 0;
            $revenueChangePercent = abs($revenueChangePercent);
        } elseif ($monthlyRevenue > 0) {
            // If previous month was 0 but current month has revenue, show 100% increase
            $revenueChangePercent = 100;
            $revenueChangeIsPositive = true;
        }

        // Collected Amount (from payments)
        $collectedAmount = Payment::whereHas('bill.room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->whereHas('bill', function ($q) use ($currentMonth, $currentYear) {
            $q->where('month', $currentMonth)
              ->where('year', $currentYear);
        })
        ->sum('amount');

        // Monthly pending amount (this month): revenue - collected this month
        $monthlyPending = $monthlyRevenue - $collectedAmount;

        // Collection Rate for current month
        $collectionRate = $monthlyRevenue > 0 ? round(($collectedAmount / $monthlyRevenue) * 100, 1) : 0;

        // Total unpaid amount across all time: sum of bills with status pending or partial
        $totalUnpaidAmount = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->whereIn('status', ['pending', 'partial'])->sum('amount');

        // Unpaid Bills Count (all bills not fully paid: pending or partial)
        $unpaidBills = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->whereIn('status', ['pending', 'partial'])
        ->count();

        // New Renter Requests (status = 'new')
        $newRenterRequests = RenterRequest::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('status', 'new')
        ->count();

        // Revenue chart data for last 6 months
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $revenue = Bill::whereHas('room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('month', $month)
            ->where('year', $year)
            ->sum('amount');
            
            $collected = Payment::whereHas('bill.room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereHas('bill', function ($q) use ($month, $year) {
                $q->where('month', $month)->where('year', $year);
            })
            ->sum('amount');
            
            $revenueChart[] = [
                'month' => $date->format('M'),
                'monthFull' => $date->format('F'),
                'revenue' => $revenue,
                'collected' => $collected,
            ];
        }

        // Recent Contracts with pagination
        $contracts = Contract::with('room.house', 'renterRequest')
        ->whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->paginate(6) // Load 6 items per page
        ->through(function($contract) {
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
                'room' => $contract->room,
                'renterRequest' => $contract->renterRequest,
            ];
        });

        $stats = [
            'totalHouses' => $totalHouses,
            'totalRooms' => $totalRooms,
            'occupiedRooms' => $occupiedRooms,
            'vacantRooms' => $vacantRooms,
            'activeContracts' => $activeContracts,
            'totalRenters' => $totalRenters,
            'newRenterRequests' => $newRenterRequests,
            'monthlyRevenue' => $monthlyRevenue,
            'previousMonthRevenue' => $previousMonthRevenue,
            'revenueChangePercent' => $revenueChangePercent,
            'revenueChangeIsPositive' => $revenueChangeIsPositive,
            'collectedAmount' => $collectedAmount,
            'pendingAmount' => $totalUnpaidAmount, // now shows total unpaid across all time
            'monthlyPending' => $monthlyPending,    // keep monthly pending as separate value
            'collectionRate' => $collectionRate,
            'unpaidBills' => $unpaidBills,
            'revenueChart' => $revenueChart,
        ];

        return Inertia::render('Landlord/Dashboard', [
            'stats' => $stats,
            'contracts' => $contracts,
        ]);
    }
}
