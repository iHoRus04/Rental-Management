<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'room_limit',
        'duration_value',
        'duration_type',
        'duration_months',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'room_limit' => 'integer',
        'duration_value' => 'integer',
        'duration_type' => 'string',
        'duration_months' => 'integer',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
