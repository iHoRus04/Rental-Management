<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'type',
        'reminder_date',
        'message',
        'is_sent',
    ];

    protected $casts = [
        'reminder_date' => 'date',
        'is_sent' => 'boolean',
    ];

    /**
     * Get the contract for this reminder
     */
    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Scope for upcoming reminders (not sent yet and date is today or in past)
     */
    public function scopePending($query)
    {
        return $query->where('is_sent', false)
                     ->where('reminder_date', '<=', now());
    }

    /**
     * Scope for future reminders
     */
    public function scopeUpcoming($query)
    {
        return $query->where('is_sent', false)
                     ->where('reminder_date', '>', now());
    }

    /**
     * Mark reminder as sent
     */
    public function markAsSent()
    {
        $this->update(['is_sent' => true]);
    }
}
