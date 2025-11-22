<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Renter;

class RenterSeeder extends Seeder
{
    public function run()
    {
        // Tạo một số người thuê với thông tin cố định
        $renters = [
            [
                'name' => 'Nguyễn Văn An',
                'phone' => '0901234567',
                'email' => 'nguyenvanan@gmail.com',
                'id_number' => '0123456789',
                'address' => '123 Đường ABC, Quận 1, TP.HCM',
            ],
            [
                'name' => 'Trần Thị Bình',
                'phone' => '0912345678',
                'email' => 'tranthibinh@gmail.com',
                'id_number' => '0234567891',
                'address' => '456 Đường XYZ, Quận 2, TP.HCM',
            ],
            [
                'name' => 'Lê Văn Cường',
                'phone' => '0923456789',
                'email' => 'levancuong@gmail.com',
                'id_number' => '0345678912',
                'address' => '789 Đường DEF, Quận 3, TP.HCM',
            ],
        ];

        foreach ($renters as $renter) {
            Renter::create($renter);
        }

        // Tạo thêm 7 người thuê với dữ liệu ngẫu nhiên
        Renter::factory(7)->create();
    }
}