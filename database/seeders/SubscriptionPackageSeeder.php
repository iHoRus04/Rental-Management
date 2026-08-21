<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Package;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SubscriptionPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tạo các gói dịch vụ mẫu
        $basic = Package::create([
            'name' => 'Gói Cơ Bản',
            'price' => 150000.00,
            'room_limit' => 15,
            'duration_value' => 1,
            'duration_type' => 'month',
            'duration_months' => 1,
            'description' => 'Phù hợp cho chủ trọ nhỏ. Hỗ trợ tối đa 15 phòng, đầy đủ chức năng quản lý hóa đơn và sự cố.',
            'is_active' => true,
        ]);

        $standard = Package::create([
            'name' => 'Gói Phổ Thông',
            'price' => 450000.00,
            'room_limit' => 50,
            'duration_value' => 3,
            'duration_type' => 'month',
            'duration_months' => 3,
            'description' => 'Phù hợp cho chuỗi nhà trọ vừa. Hỗ trợ tối đa 50 phòng, xuất hóa đơn hàng loạt và báo cáo doanh thu.',
            'is_active' => true,
        ]);

        $vip = Package::create([
            'name' => 'Gói Premium (VIP)',
            'price' => 1200000.00,
            'room_limit' => 9999,
            'duration_value' => 6,
            'duration_type' => 'month',
            'duration_months' => 6,
            'description' => 'Không giới hạn quy mô. Hỗ trợ tất cả tính năng quản trị cao cấp, phân quyền nhân viên không giới hạn.',
            'is_active' => true,
        ]);

        // 2. Tạo lịch sử giao dịch mẫu để hiển thị biểu đồ doanh thu
        // $landlord = User::where('role', 'landlord')->first();

        // if ($landlord) {
        //     // Giao dịch tháng 4
        //     Subscription::create([
        //         'user_id' => $landlord->id,
        //         'package_id' => $basic->id,
        //         'start_date' => Carbon::now()->subMonths(2)->startOfMonth(),
        //         'end_date' => Carbon::now()->subMonths(2)->startOfMonth()->addMonths(1),
        //         'price_paid' => 150000.00,
        //         'status' => 'expired',
        //         'payment_status' => 'paid',
        //         'created_at' => Carbon::now()->subMonths(2)->startOfMonth(),
        //     ]);

        //     // Giao dịch tháng 5
        //     Subscription::create([
        //         'user_id' => $landlord->id,
        //         'package_id' => $standard->id,
        //         'start_date' => Carbon::now()->subMonth()->startOfMonth(),
        //         'end_date' => Carbon::now()->subMonth()->startOfMonth()->addMonths(3),
        //         'price_paid' => 450000.00,
        //         'status' => 'expired',
        //         'payment_status' => 'paid',
        //         'created_at' => Carbon::now()->subMonth()->startOfMonth(),
        //     ]);

        //     // Giao dịch tháng 6 (hiện tại - đang hoạt động)
        //     Subscription::create([
        //         'user_id' => $landlord->id,
        //         'package_id' => $vip->id,
        //         'start_date' => Carbon::now()->startOfMonth(),
        //         'end_date' => Carbon::now()->startOfMonth()->addMonths(6),
        //         'price_paid' => 1200000.00,
        //         'status' => 'active',
        //         'payment_status' => 'paid',
        //         'created_at' => Carbon::now()->startOfMonth(),
        //     ]);
        // }
    }
}
