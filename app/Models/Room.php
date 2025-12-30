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
}