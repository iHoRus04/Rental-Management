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
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Tạo tài khoản Chủ trọ
        $landlordUser = User::create([
            'name' => 'Chủ trọ A',
            'email' => 'landlord@example.com',
            'password' => Hash::make('password'),
            'role' => 'landlord',
        ]);

        // Thêm thông tin mở rộng cho chủ trọ
        Landlord::create([
            'user_id' => $landlordUser->id,
            'phone' => '0123456789',
            'address' => 'Hồ Chí Minh',
        ]);
    }
}
