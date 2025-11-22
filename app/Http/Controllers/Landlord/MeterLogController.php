<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\MeterLog;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeterLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meterLogs = MeterLog::with('room')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        $rooms = Room::all();

        return Inertia::render('Landlord/MeterLogs/Index', [
            'meterLogs' => $meterLogs,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rooms = Room::all();

        return Inertia::render('Landlord/MeterLogs/Create', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'electric_reading' => 'required|integer|min:0',
            'water_reading' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $existingLog = MeterLog::where('room_id', $validated['room_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($existingLog) {
            return redirect()->route('landlord.meter-logs.index')
                ->with('error', 'Chỉ số cho tháng/năm này đã tồn tại!');
        }

        $meterLog = new MeterLog($validated);
        $meterLog->calculateUsage();
        $meterLog->save();

        return redirect()->route('landlord.meter-logs.index')
            ->with('success', 'Thêm chỉ số điện nước thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(MeterLog $meterLog)
    {
        $meterLog->load('room');

        $history = MeterLog::where('room_id', $meterLog->room_id)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        return Inertia::render('Landlord/MeterLogs/Show', [
            'meterLog' => $meterLog,
            'history' => $history,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MeterLog $meterLog)
    {
        $meterLog->load('room');
        $rooms = Room::all();

        return Inertia::render('Landlord/MeterLogs/Edit', [
            'meterLog' => $meterLog,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MeterLog $meterLog)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'electric_reading' => 'required|integer|min:0',
            'water_reading' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        // Check if another log exists with same month/year but different room
        if ($meterLog->room_id != $validated['room_id'] || 
            $meterLog->month != $validated['month'] || 
            $meterLog->year != $validated['year']) {
            
            $existingLog = MeterLog::where('room_id', $validated['room_id'])
                ->where('month', $validated['month'])
                ->where('year', $validated['year'])
                ->where('id', '!=', $meterLog->id)
                ->first();

            if ($existingLog) {
                return redirect()->route('landlord.meter-logs.index')
                    ->with('error', 'Chỉ số cho tháng/năm này đã tồn tại!');
            }
        }

        $meterLog->fill($validated);
        $meterLog->calculateUsage();
        $meterLog->save();

        return redirect()->route('landlord.meter-logs.show', $meterLog->id)
            ->with('success', 'Cập nhật chỉ số thành công!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MeterLog $meterLog)
    {
        $meterLog->delete();

        return redirect()->route('landlord.meter-logs.index')
            ->with('success', 'Đã xóa chỉ số điện nước');
    }
}
