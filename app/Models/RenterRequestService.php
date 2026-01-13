<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RenterRequestService extends Model
{
    use HasFactory;

    protected $fillable = [
        'renter_request_id',
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

    public function renterRequest()
    {
        return $this->belongsTo(RenterRequest::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
