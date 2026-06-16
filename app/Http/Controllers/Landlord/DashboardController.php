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
}
