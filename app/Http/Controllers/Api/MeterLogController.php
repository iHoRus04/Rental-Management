<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MeterLog;
use Illuminate\Http\Request;

class MeterLogController extends Controller
{
    /**
     * Get meter log for a specific room, month, and year
     */
    public function show($roomId, $month, $year)
    {
        $meterLog = MeterLog::where('room_id', $roomId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if (!$meterLog) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($meterLog);
    }
}
