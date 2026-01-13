<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'default_price',
        'unit',
        'is_active',
    ];

    protected $casts = [
        'default_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get rooms that use this service
     */
    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_services')
            ->withPivot('price', 'is_active', 'note')
            ->withTimestamps();
    }

    /**
     * Get room services
     */
    public function roomServices()
    {
        return $this->hasMany(RoomService::class);
    }

    /**
     * Get renter requests that use this service
     */
    public function renterRequests()
    {
        return $this->belongsToMany(RenterRequest::class, 'renter_request_services')
            ->withPivot('price', 'is_active', 'note', 'start_date', 'end_date', 'id')
            ->withTimestamps();
    }

    /**
     * Get renter request services
     */
    public function renterRequestServices()
    {
        return $this->hasMany(RenterRequestService::class);
    }
}
