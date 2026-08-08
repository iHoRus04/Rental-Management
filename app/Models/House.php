<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'address',
        'description',
        'image',
        'electric_price',
        'water_price',
        'bank_name',
        'account_no',
        'account_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
       public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
