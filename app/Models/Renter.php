<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Renter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',         // Tên người thuê
        'phone',        // SĐT
        'email',        // Email
        'id_number',    // CCCD
        'address',      // Địa chỉ
    ];

    // Quan hệ: 1 người thuê có thể có nhiều hợp đồng
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    /**
     * Get services associated with this renter
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'renter_services')
            ->withPivot('price', 'is_active', 'note', 'start_date', 'end_date')
            ->withTimestamps();
    }

    /**
     * Get renter services
     */
    public function renterServices()
    {
        return $this->hasMany(RenterService::class);
    }
}
