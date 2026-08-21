<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'room_id',
        'renter_request_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'deposit',
        'payment_date',
        'status',
        'terms',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'integer',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function renterRequest()
    {
        return $this->belongsTo(RenterRequest::class)->withTrashed();
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
}
