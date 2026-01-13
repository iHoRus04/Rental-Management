<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'name',
        'price',
        'status',
        'floor',
        'area',
        'description',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    } 
    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * Get services associated with this room
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'room_services')
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
}
