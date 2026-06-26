<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffRole extends Model
{
    protected $fillable = ['name', 'description', 'landlord_id'];

    // =====================================================
    // PERMISSIONS — danh sách cố định trong code
    // =====================================================

    public const MODULES = [
        'houses'           => 'Quản lý nhà trọ',
        'rooms'            => 'Quản lý phòng',
        'contracts'        => 'Hợp đồng',
        'bills'            => 'Hóa đơn',
        'payments'         => 'Thanh toán',
        'meter_logs'       => 'Điện nước',
        'renter_requests'  => 'Yêu cầu thuê',
        'tenant_requests'  => 'Yêu cầu từ người thuê',
        'reminders'        => 'Nhắc nhở',
        'services'         => 'Dịch vụ',
        'reports'          => 'Báo cáo',
    ];

    public const ACTIONS = ['view', 'create', 'edit', 'delete'];

    /** Danh sách tất cả permissions có thể cấp */
    public static function allPermissions(): array
    {
        $perms = [];
        foreach (array_keys(self::MODULES) as $module) {
            $actions = $module === 'reports' ? ['view'] : self::ACTIONS;
            foreach ($actions as $action) {
                $perms[] = "{$module}.{$action}";
            }
        }
        return $perms;
    }

    // =====================================================
    // RELATIONSHIPS
    // =====================================================

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function rolePermissions()
    {
        return $this->hasMany(StaffRolePermission::class, 'role_id');
    }

    public function staff()
    {
        return $this->hasMany(User::class, 'staff_role_id');
    }

    // =====================================================
    // HELPERS
    // =====================================================

    public function hasPermission(string $permission): bool
    {
        return $this->rolePermissions->contains('permission', $permission);
    }

    public function getPermissionsArray(): array
    {
        return $this->rolePermissions->pluck('permission')->toArray();
    }

    public function syncPermissions(array $permissions): void
    {
        // Chỉ giữ lại permissions hợp lệ
        $valid = array_intersect($permissions, self::allPermissions());

        $this->rolePermissions()->delete();

        foreach ($valid as $perm) {
            StaffRolePermission::create([
                'role_id'    => $this->id,
                'permission' => $perm,
            ]);
        }
    }
}
