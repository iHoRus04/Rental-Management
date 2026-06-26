<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffRolePermission extends Model
{
    protected $fillable = ['role_id', 'permission'];

    public function role()
    {
        return $this->belongsTo(StaffRole::class, 'role_id');
    }
}
