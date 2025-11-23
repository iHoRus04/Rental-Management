<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RenterRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'full_name',
        'phone',
        'email',
        'message',
        'move_in_date',
        'status',
    ];

    protected $casts = [
        'move_in_date' => 'date',
    ];

    /**
     * Get the room that was requested
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
