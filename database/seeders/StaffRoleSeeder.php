<?php

namespace Database\Seeders;

use App\Models\StaffRole;
use App\Models\StaffRolePermission;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy tất cả chủ trọ hiện có để khởi tạo 3 vai trò mẫu
        $landlords = User::where('role', 'landlord')->get();

        foreach ($landlords as $landlord) {
            StaffRole::createDefaultRolesForLandlord($landlord->id);
        }

        // Gán vai trò mẫu "Quản lý Tòa nhà" cho tài khoản Nhân viên A (staff@example.com)
        $staffUser = User::where('email', 'staff@dreamhouse.vn')->first();
        if ($staffUser && $staffUser->landlord_id) {
            $managerRole = StaffRole::where('landlord_id', $staffUser->landlord_id)
                ->where('name', 'Quản lý Tòa nhà')
                ->first();

            if ($managerRole) {
                $staffUser->update([
                    'staff_role_id' => $managerRole->id,
                ]);
            }
        }
    }
}
