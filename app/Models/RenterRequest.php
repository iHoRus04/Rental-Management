<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RenterRequest extends Model
{
  protected $fillable = ['name','phone','email','room_id','message','status'];

  public function room() { return $this->belongsTo(Room::class); }
  
  public function contracts() { return $this->hasMany(Contract::class); }
}
