<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Tiền điện',
                'description' => 'Tiền điện tính theo số kWh tiêu thụ',
                'default_price' => 3500,
                'unit' => 'kwh',
                'is_active' => true,
            ],
            [
                'name' => 'Tiền nước',
                'description' => 'Tiền nước tính theo số m³ tiêu thụ',
                'default_price' => 15000,
                'unit' => 'm3',
                'is_active' => true,
            ],
            [
                'name' => 'Internet',
                'description' => 'Phí internet cố định hàng tháng',
                'default_price' => 100000,
                'unit' => 'month',
                'is_active' => true,
            ],
            [
                'name' => 'Vệ sinh chung',
                'description' => 'Chi phí vệ sinh khu vực chung',
                'default_price' => 50000,
                'unit' => 'month',
                'is_active' => true,
            ],
            [
                'name' => 'Gửi xe máy',
                'description' => 'Phí gửi xe máy hàng tháng',
                'default_price' => 50000,
                'unit' => 'month',
                'is_active' => true,
            ],
            [
                'name' => 'Gửi xe ô tô',
                'description' => 'Phí gửi xe ô tô hàng tháng',
                'default_price' => 500000,
                'unit' => 'month',
                'is_active' => true,
            ],
            [
                'name' => 'Bảo trì',
                'description' => 'Chi phí bảo trì thiết bị',
                'default_price' => 30000,
                'unit' => 'service',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
