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
        $basic = Package::updateOrCreate(
            ['name' => 'Gói Cơ Bản'],
            [
                'price' => 150000.00,
                'room_limit' => 15,
                'duration_value' => 1,
                'duration_type' => 'month',
                'duration_months' => 1,
                'description' => 'Phù hợp cho chủ trọ nhỏ. Hỗ trợ tối đa 15 phòng, đầy đủ chức năng quản lý hóa đơn và sự cố.',
                'is_active' => true,
            ]
        );

        $standard = Package::updateOrCreate(
            ['name' => 'Gói Phổ Thông'],
            [
                'price' => 450000.00,
                'room_limit' => 50,
                'duration_value' => 3,
                'duration_type' => 'month',
                'duration_months' => 3,
                'description' => 'Phù hợp cho chuỗi nhà trọ vừa. Hỗ trợ tối đa 50 phòng, xuất hóa đơn hàng loạt và báo cáo doanh thu.',
                'is_active' => true,
            ]
        );

        $vip = Package::updateOrCreate(
            ['name' => 'Gói Premium (VIP)'],
            [
                'price' => 1200000.00,
                'room_limit' => 9999,
                'duration_value' => 6,
                'duration_type' => 'month',
                'duration_months' => 6,
                'description' => 'Không giới hạn quy mô. Hỗ trợ tất cả tính năng quản trị cao cấp, phân quyền nhân viên không giới hạn.',
                'is_active' => true,
            ]
        );
    }
}
