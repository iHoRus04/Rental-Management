<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RenterService extends Model
{
    use HasFactory;

    protected $fillable = [
        'renter_id',
        'service_id',
        'price',
        'is_active',
        'note',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the renter
     */
    public function renter()
    {
        return $this->belongsTo(Renter::class);
    }

    /**
     * Get the service
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
