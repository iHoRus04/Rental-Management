<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'room_id',
        'renter_id',
        'month',
        'year',
        'room_price',
        'electric_kwh',
        'electric_price',
        'electric_cost',
        'water_usage',
        'water_price',
        'water_cost',
        'internet_cost',
        'trash_cost',
        'other_costs',
        'amount',
        'paid_amount',
        'due_date',
        'paid_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function renter()
    {
        return $this->belongsTo(Renter::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Tính tiền điện từ số lượng và đơn giá
    public function calculateElectricCost()
    {
        $this->electric_cost = ($this->electric_kwh ?? 0) * ($this->electric_price ?? 0);
        return $this->electric_cost;
    }

    // Tính tiền nước từ số lượng và đơn giá
    public function calculateWaterCost()
    {
        $this->water_cost = ($this->water_usage ?? 0) * ($this->water_price ?? 0);
        return $this->water_cost;
    }

    // Tính tổng tiền từ các chi phí
    public function calculateTotal()
    {
        // Tính lại tiền điện & nước nếu có
        $this->calculateElectricCost();
        $this->calculateWaterCost();
        
        $total = $this->room_price + 
                 $this->electric_cost + 
                 $this->water_cost + 
                 $this->internet_cost + 
                 $this->trash_cost + 
                 $this->other_costs;
        
        $this->amount = $total;
        return $total;
    }

    // Cập nhật status dựa trên paid_amount
    public function updatePaymentStatus()
    {
        if ($this->paid_amount == 0) {
            $this->status = 'pending';
            $this->paid_date = null;
        } elseif ($this->paid_amount >= $this->amount) {
            $this->status = 'paid';
            if (!$this->paid_date) {
                $this->paid_date = now()->toDateString();
            }
            $this->paid_amount = $this->amount;
        } else {
            $this->status = 'partial';
        }
        
        return $this;
    }
}
