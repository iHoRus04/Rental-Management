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
    ];

    public const ACTIONS = ['view', 'create', 'edit', 'delete'];

    /** Danh sách tất cả permissions có thể cấp */
    public static function allPermissions(): array
    {
        $perms = [];
        foreach (array_keys(self::MODULES) as $module) {
            foreach (self::ACTIONS as $action) {
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
        // 🟢 Tự động hỗ trợ: Nếu nhân viên có bất kỳ quyền nào về Phòng trọ hoặc Hợp đồng
        // ➔ Tự động bổ sung quyền 'houses.view' để Nhân viên luôn có menu/đường dẫn vào chọn Nhà trọ
        $hasChildPermissions = collect($permissions)->contains(function ($perm) {
            return str_starts_with($perm, 'rooms.') 
                || str_starts_with($perm, 'contracts.');
        });

        if ($hasChildPermissions && !in_array('houses.view', $permissions)) {
            $permissions[] = 'houses.view';
        }

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

    /**
     * Khởi tạo 3 vai trò mặc định chuẩn cho một Chủ trọ mới
     */
    public static function createDefaultRolesForLandlord(int $landlordId): void
    {
        // Tránh tạo trùng lặp nếu đã có vai trò
        if (self::where('landlord_id', $landlordId)->exists()) {
            return;
        }

        // 1. Quản lý Tòa nhà
        $managerRole = self::create([
            'landlord_id' => $landlordId,
            'name'        => 'Quản lý Tòa nhà',
            'description' => 'Có toàn quyền quản lý phòng, hợp đồng, thu tiền và tiếp nhận sự cố.',
        ]);
        $managerRole->syncPermissions([
            'houses.view', 'houses.create', 'houses.edit',
            'rooms.view', 'rooms.create', 'rooms.edit',
            'contracts.view', 'contracts.create', 'contracts.edit',
            'bills.view', 'bills.create', 'bills.edit',
            'payments.view', 'payments.create',
            'meter_logs.view', 'meter_logs.create', 'meter_logs.edit',
            'renter_requests.view', 'renter_requests.edit',
            'tenant_requests.view', 'tenant_requests.edit',
            'reminders.view', 'reminders.create',
            'services.view',
        ]);

        // 2. Kế toán / Thu ngân
        $accountantRole = self::create([
            'landlord_id' => $landlordId,
            'name'        => 'Kế toán / Thu ngân',
            'description' => 'Phụ trách ghi chỉ số điện nước, lập hóa đơn và thu tiền.',
        ]);
        $accountantRole->syncPermissions([
            'bills.view', 'bills.create', 'bills.edit',
            'payments.view', 'payments.create',
            'meter_logs.view', 'meter_logs.create', 'meter_logs.edit',
        ]);

        // 3. Kỹ thuật / Bảo trì
        $techRole = self::create([
            'landlord_id' => $landlordId,
            'name'        => 'Kỹ thuật / Bảo trì',
            'description' => 'Phụ trách ghi chỉ số điện nước và xử lý các báo hỏng hóc từ khách thuê.',
        ]);
        $techRole->syncPermissions([
            'meter_logs.view', 'meter_logs.create', 'meter_logs.edit',
            'tenant_requests.view', 'tenant_requests.edit',
            'rooms.view',
        ]);
    }
}
