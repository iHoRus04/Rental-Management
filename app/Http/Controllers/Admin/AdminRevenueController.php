<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminRevenueController extends Controller
{
    public function index()
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // 1. Chỉ số tổng quan
        $totalRevenue = Subscription::where('payment_status', 'paid')->sum('price_paid');
        
        $monthlyRevenue = Subscription::where('payment_status', 'paid')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('price_paid');

        // Doanh thu tháng trước để so sánh
        $lastMonth = Carbon::now()->subMonth()->month;
        $lastMonthYear = Carbon::now()->subMonth()->year;
        $lastMonthRevenue = Subscription::where('payment_status', 'paid')
            ->whereMonth('created_at', $lastMonth)
            ->whereYear('created_at', $lastMonthYear)
            ->sum('price_paid');

        $activeSubscriptionsCount = Subscription::where('status', 'active')
            ->where('end_date', '>=', now())
            ->count();

        $newSubscriptionsCount = Subscription::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        // Tỷ lệ tăng trưởng doanh thu tháng
        $revenueGrowthPercent = 0;
        if ($lastMonthRevenue > 0) {
            $revenueGrowthPercent = round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1);
        } elseif ($monthlyRevenue > 0) {
            $revenueGrowthPercent = 100;
        }

        // 2. Biểu đồ doanh thu 6 tháng gần nhất
        $revenueChartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $m = $date->month;
            $y = $date->year;

            $rev = Subscription::where('payment_status', 'paid')
                ->whereMonth('created_at', $m)
                ->whereYear('created_at', $y)
                ->sum('price_paid');

            $revenueChartData[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $rev,
            ];
        }

        // 3. Phân khúc doanh thu theo gói cước (Biểu đồ tròn)
        $packageSegments = Subscription::where('payment_status', 'paid')
            ->join('packages', 'subscriptions.package_id', '=', 'packages.id')
            ->select('packages.name as package_name', DB::raw('SUM(subscriptions.price_paid) as total'))
            ->groupBy('packages.id', 'packages.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->package_name,
                    'value' => (float) $item->total,
                ];
            });

        // 4. Danh sách giao dịch gần đây
        $recentTransactions = Subscription::with(['user', 'package'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'user_name' => $sub->user->name ?? 'N/A',
                    'user_email' => $sub->user->email ?? 'N/A',
                    'package_name' => $sub->package->name ?? 'N/A',
                    'price_paid' => (float) $sub->price_paid,
                    'start_date' => $sub->start_date->format('d/m/Y H:i'),
                    'end_date' => $sub->end_date->format('d/m/Y'),
                    'status' => $sub->status,
                    'payment_status' => $sub->payment_status,
                ];
            });

        $stats = [
            'total_revenue' => (float) $totalRevenue,
            'monthly_revenue' => (float) $monthlyRevenue,
            'active_subs' => $activeSubscriptionsCount,
            'new_subs' => $newSubscriptionsCount,
            'growth_percent' => $revenueGrowthPercent,
            'chart_data' => $revenueChartData,
            'segments' => $packageSegments,
        ];

        return Inertia::render('Admin/Revenue/Index', [
            'stats' => $stats,
            'transactions' => $recentTransactions,
        ]);
    }
}
