<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Room;
use App\Models\Contract;
use App\Models\Renter;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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

        // Total Renters
        $totalRenters = Renter::whereHas('contracts.room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->distinct()->count();

        // Monthly Revenue Stats
        $monthlyBills = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('month', $currentMonth)
        ->where('year', $currentYear)
        ->get();

        $monthlyRevenue = $monthlyBills->sum('amount');

        // Collected Amount (from payments)
        $collectedAmount = Payment::whereHas('bill.room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->whereHas('bill', function ($q) use ($currentMonth, $currentYear) {
            $q->where('month', $currentMonth)
              ->where('year', $currentYear);
        })
        ->sum('amount');

        // Pending Amount
        $pendingAmount = $monthlyRevenue - $collectedAmount;

        // Collection Rate
        $collectionRate = $monthlyRevenue > 0 ? round(($collectedAmount / $monthlyRevenue) * 100, 1) : 0;

        // Unpaid Bills Count
        $unpaidBills = Bill::whereHas('room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('month', $currentMonth)
        ->where('year', $currentYear)
        ->where('status', 'unpaid')
        ->count();

        $stats = [
            'totalHouses' => $totalHouses,
            'totalRooms' => $totalRooms,
            'occupiedRooms' => $occupiedRooms,
            'vacantRooms' => $vacantRooms,
            'activeContracts' => $activeContracts,
            'totalRenters' => $totalRenters,
            'monthlyRevenue' => $monthlyRevenue,
            'collectedAmount' => $collectedAmount,
            'pendingAmount' => $pendingAmount,
            'collectionRate' => $collectionRate,
            'unpaidBills' => $unpaidBills,
        ];

        return Inertia::render('Landlord/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
