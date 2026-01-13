<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RenterRequest extends Model
{
  protected $fillable = ['name','phone','email','room_id','message','status'];

  public function room() { return $this->belongsTo(Room::class); }
  
  public function contracts() { return $this->hasMany(Contract::class); }
  
  // Service relationships
  public function services()
  {
      return $this->belongsToMany(Service::class, 'renter_request_services')
          ->withPivot('price', 'is_active', 'note', 'start_date', 'end_date', 'id')
          ->withTimestamps();
  }
  
  public function renterRequestServices()
  {
      return $this->hasMany(RenterRequestService::class);
  }
}
