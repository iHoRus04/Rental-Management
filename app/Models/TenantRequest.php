<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantRequest extends Model
{
    protected $fillable = [
        'tenant_id',
        'landlord_id',
        'room_id',
        'type',
        'title',
        'description',
        'priority',
        'status',
        'landlord_response',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
