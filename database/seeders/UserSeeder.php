<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Landlord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo tài khoản Admin
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@example.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'status'   => 'active',
        ]);

        // Tạo tài khoản Chủ trọ
        $landlordUser = User::create([
            'name'     => 'Chủ trọ A',
            'email'    => 'landlord@example.com',
            'password' => Hash::make('password'),
            'role'     => 'landlord',
            'status'   => 'active',
        ]);

        // Thêm thông tin mở rộng cho chủ trọ
        Landlord::create([
            'user_id' => $landlordUser->id,
            'phone'   => '0123456789',
            'address' => 'Hồ Chí Minh',
        ]);

        // Tạo tài khoản Nhân viên mẫu
        User::create([
            'name'        => 'Nhân viên A',
            'email'       => 'staff@example.com',
            'password'    => Hash::make('password'),
            'role'        => 'staff',
            'status'      => 'active',
            'phone'       => '0987654321',
            'landlord_id' => $landlordUser->id,
        ]);
    }
}
