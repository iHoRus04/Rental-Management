<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\House;
use App\Models\StaffRole;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'plain_password',
        'phone',
        'role',
        'status',
        'landlord_id',
        'renter_request_id',
        'staff_role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =====================================================
    // RELATIONSHIPS
    // =====================================================

    /** Nhà trọ mà landlord sở hữu */
    public function houses()
    {
        return $this->hasMany(House::class);
    }

    /** Nhà trọ mà staff được gán vào (pivot: house_staff) */
    public function staffedHouses()
    {
        return $this->belongsToMany(House::class, 'house_staff', 'staff_id', 'house_id')
                    ->withPivot('assigned_at');
    }

    /** Nhân viên do landlord tạo ra */
    public function staffMembers()
    {
        return $this->hasMany(User::class, 'landlord_id');
    }

    /** Vai trò RBAC của staff */
    public function staffRole()
    {
        return $this->belongsTo(StaffRole::class, 'staff_role_id');
    }

    /** Landlord của staff này */
    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function renterRequest()
    {
        return $this->belongsTo(RenterRequest::class);
    }

    public function tenantRequests()
    {
        return $this->hasMany(TenantRequest::class, 'tenant_id');
    }

    public function landlordRequests()
    {
        return $this->hasMany(TenantRequest::class, 'landlord_id');
    }

    // =====================================================
    // AUTHORIZATION HELPERS
    // =====================================================

    /**
     * Trả về danh sách ID các nhà mà user có thể quản lý:
     * - Landlord: các nhà mình sở hữu
     * - Staff: các nhà được gán
     */
    public function getAccessibleHouseIds(): array
    {
        if ($this->role === 'landlord') {
            return $this->houses()->pluck('id')->toArray();
        }

        if ($this->role === 'staff') {
            return $this->staffedHouses()->pluck('houses.id')->toArray();
        }

        return [];
    }

    /**
     * Kiểm tra xem user có quyền quản lý nhà cụ thể không.
     */
    public function managesHouse($house): bool
    {
        $houseId = is_object($house) ? $house->id : $house;
        return in_array($houseId, $this->getAccessibleHouseIds());
    }

    // =====================================================
    // ROLE HELPERS
    // =====================================================

    public function isLandlord(): bool
    {
        return $this->role === 'landlord';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isTenant(): bool
    {
        return $this->role === 'tenant';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    // =====================================================
    // PERMISSION HELPERS
    // =====================================================

    /**
     * Kiểm tra user có quyền thực hiện một permission cụ thể không.
     * Landlord luôn có tất cả quyền. Staff lấy từ StaffRole.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isLandlord() || $this->isAdmin()) {
            return true;
        }

        if ($this->isStaff()) {
            $role = $this->staffRole;
            if (!$role) return false;
            $role->load('rolePermissions');
            return $role->hasPermission($permission);
        }

        return false;
    }

    /**
     * Trả về mảng permissions của user.
     * Landlord: ['*'], Staff: danh sách quyền cụ thể.
     */
    public function getStaffPermissions(): array
    {
        if ($this->isLandlord() || $this->isAdmin()) {
            return ['*'];
        }

        if ($this->isStaff()) {
            $role = $this->staffRole;
            if (!$role) return [];
            $role->load('rolePermissions');
            return $role->getPermissionsArray();
        }

        return [];
    }

    /**
     * Lấy ID của landlord (chính mình nếu là landlord, hoặc landlord_id nếu là staff)
     */
    public function getLandlordId(): int
    {
        return $this->role === 'staff' ? $this->landlord_id : $this->id;
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('id', 'desc');
    }

    public function getRoomLimit(): int
    {
        if ($this->role === 'staff') {
            $landlord = User::find($this->landlord_id);
            return $landlord ? $landlord->getRoomLimit() : 5;
        }

        $activeSub = $this->activeSubscription()->with('package')->first();
        if ($activeSub && $activeSub->package) {
            return (int) $activeSub->package->room_limit;
        }

        return 5; // Giới hạn dùng thử
    }

    public function getCurrentRoomCount(): int
    {
        $landlordId = $this->getLandlordId();
        return \App\Models\Room::whereHas('house', function ($q) use ($landlordId) {
            $q->where('user_id', $landlordId);
        })->count();
    }
}
