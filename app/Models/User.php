<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\House;

class User extends Authenticatable
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
        'phone',
        'role',
        'status',
        'landlord_id',
        'renter_request_id',
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
}
