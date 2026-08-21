<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StaffRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tạo tài khoản Super Admin (Đã kích hoạt)
        User::updateOrCreate(
            ['email' => 'admin@dreamhouse.vn'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('12345678'),
                'role'              => 'admin',
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 2. Tạo tài khoản Chủ trọ (Đã kích hoạt)
        $landlordUser = User::updateOrCreate(
            ['email' => 'landlord@dreamhouse.vn'],
            [
                'name'              => 'Chủ Trọ DreamHouse',
                'password'          => Hash::make('12345678'),
                'role'              => 'landlord',
                'status'            => 'active',
                'phone'             => '0912345678',
                'email_verified_at' => now(),
            ]
        );

        // Khởi tạo 3 vai trò mặc định cho Chủ trọ
        StaffRole::createDefaultRolesForLandlord($landlordUser->id);
        // 3. Tạo tài khoản Nhân viên mẫu (Đã kích hoạt)
        User::updateOrCreate(
            ['email' => 'staff@dreamhouse.vn'],
            [
                'name'              => 'Nhân Viên Vận Hành',
                'password'          => Hash::make('12345678'),
                'role'              => 'staff',
                'status'            => 'active',
                'phone'             => '0987654321',
                'landlord_id'       => $landlordUser->id,
                'email_verified_at' => now(),
            ]
        );

        // 4. Tạo tài khoản Khách thuê mẫu (Đã kích hoạt)
        User::updateOrCreate(
            ['email' => 'tenant@dreamhouse.vn'],
            [
                'name'              => 'Khách Thuê Mẫu',
                'password'          => Hash::make('12345678'),
                'role'              => 'tenant',
                'status'            => 'active',
                'phone'             => '0909090909',
                'email_verified_at' => now(),
            ]
        );
    }
}
