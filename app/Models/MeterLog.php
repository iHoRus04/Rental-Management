<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MeterLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'month',
        'year',
        'electric_reading',
        'water_reading',
        'electric_usage',
        'water_usage',
        'notes',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    // Tính toán chỉ số sử dụng từ chỉ số tháng trước
    public function calculateUsage()
    {
        $previousMonth = $this->month - 1;
        $previousYear = $this->year;
        
        if ($this->month == 1) {
            $previousMonth = 12;
            $previousYear = $this->year - 1;
        }

        $previousLog = MeterLog::where('room_id', $this->room_id)
            ->where('month', $previousMonth)
            ->where('year', $previousYear)
            ->first();

        if ($previousLog) {
            $this->electric_usage = max(0, $this->electric_reading - $previousLog->electric_reading);
            $this->water_usage = max(0, $this->water_reading - $previousLog->water_reading);
        } else {
            // Nếu không có bản ghi tháng trước, sử dụng chỉ số hiện tại
            $this->electric_usage = $this->electric_reading;
            $this->water_usage = $this->water_reading;
        }

        return $this;
    }
}

