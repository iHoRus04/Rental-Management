<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference',
        'notes',
        'verified_by',
        'bank_transaction_code',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    /**
     * Nhân viên duyệt/xác nhận thanh toán
     */
    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
