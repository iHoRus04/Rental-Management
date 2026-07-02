<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\Feedback;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // 1. Thống kê các chỉ số cốt lõi
        $totalLandlords = User::where('role', 'landlord')->count();
        $activeLandlords = User::where('role', 'landlord')->where('status', 'active')->count();
        $totalRooms = DB::table('rooms')->count();
        $totalRevenue = Subscription::sum('price_paid');
        $pendingFeedbacksCount = Feedback::where('status', 'pending')->count();

        // Doanh thu tháng này
        $monthlyRevenue = Subscription::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('price_paid');

        // Doanh thu tháng trước
        $lastMonthRevenue = Subscription::whereYear('created_at', Carbon::now()->subMonth()->year)
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->sum('price_paid');

        $revenueChangePercent = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($monthlyRevenue > 0 ? 100 : 0);

        // 2. Biểu đồ doanh thu 12 tháng gần nhất (Bar Chart)
        $revenueChart = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = Subscription::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('price_paid');
            $revenueChart[] = [
                'month' => $date->format('m/Y'), // Hiển thị định dạng tháng/năm đầy đủ hơn để xem 12 tháng không bị lẫn năm
                'revenue' => (float) $revenue,
            ];
        }

        // 3. Phân bổ trạng thái chủ trọ (Donut Chart)
        $landlordStatusChart = [
            ['label' => 'Hoạt động', 'value' => User::where('role', 'landlord')->where('status', 'active')->count(), 'color' => '#10b981'],
            ['label' => 'Chờ duyệt', 'value' => User::where('role', 'landlord')->where('status', 'pending')->count(), 'color' => '#f59e0b'],
            ['label' => 'Hết hạn', 'value' => User::where('role', 'landlord')->where('status', 'expired')->count(), 'color' => '#ef4444'],
            ['label' => 'Bị khóa', 'value' => User::where('role', 'landlord')->where('status', 'inactive')->count(), 'color' => '#94a3b8'],
        ];

        // 4. Top gói cước phổ biến nhất (Donut Chart)
        $packageColors = ['#10b981', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];
        $topPackages = Subscription::select('package_id', DB::raw('count(*) as total'))
            ->groupBy('package_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item, $index) use ($packageColors) {
                $pkg = Package::find($item->package_id);
                return [
                    'label' => $pkg->name ?? 'N/A',
                    'value' => $item->total,
                    'color' => $packageColors[$index % count($packageColors)],
                ];
            });

        // 5. Danh sách 5 chủ trọ đăng ký gần đây nhất
        $recentLandlords = User::where('role', 'landlord')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'status' => $u->status,
                    'created_at' => $u->created_at->format('d/m/Y'),
                ];
            });

        // Gói đang hoạt động & Đăng ký mới tháng này
        $activeSubsCount = Subscription::where('status', 'active')
            ->where('end_date', '>=', Carbon::now())
            ->count();
        $newSubsCount = Subscription::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        // 6. Danh sách 10 giao dịch đăng ký gói gần nhất (bảng chi tiết)
        $recentSubscriptions = Subscription::with(['user', 'package'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'landlord_name' => $sub->user->name ?? 'N/A',
                    'landlord_email' => $sub->user->email ?? 'N/A',
                    'package_name' => $sub->package->name ?? 'N/A',
                    'price_paid' => (float) $sub->price_paid,
                    'start_date' => $sub->start_date->format('d/m/Y'),
                    'end_date' => $sub->end_date->format('d/m/Y'),
                    'status' => $sub->status,
                    'payment_status' => $sub->payment_status,
                    'created_at' => $sub->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalLandlords' => $totalLandlords,
                'activeLandlords' => $activeLandlords,
                'totalRooms' => $totalRooms,
                'totalRevenue' => (float) $totalRevenue,
                'monthlyRevenue' => (float) $monthlyRevenue,
                'revenueChangePercent' => $revenueChangePercent,
                'pendingFeedbacksCount' => $pendingFeedbacksCount,
                'activeSubsCount' => $activeSubsCount,
                'newSubsCount' => $newSubsCount,
            ],
            'revenueChart' => $revenueChart,
            'landlordStatusChart' => $landlordStatusChart,
            'topPackages' => $topPackages,
            'recentLandlords' => $recentLandlords,
            'recentSubscriptions' => $recentSubscriptions,
        ]);
    }
}
