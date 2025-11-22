<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Landlord extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

}
