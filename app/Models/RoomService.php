<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomService extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'service_id',
        'price',
        'is_active',
        'note',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the room
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the service
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
