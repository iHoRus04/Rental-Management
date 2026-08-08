<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\MeterLog;
use App\Models\Room;
use App\Models\House;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * MeterLogController
 *
 * Quản lý chỉ số điện nước (meter logs) theo phòng, theo tháng.
 * - Kiểm tra duplicate (tháng/năm cùng phòng) khi tạo hoặc cập nhật.
 * - Sử dụng method `calculateUsage()` trên model để tính mức tiêu thụ
 *   dựa trên chỉ số hiện tại và chỉ số trước đó.
 */
class MeterLogController extends Controller
{
    /**
     * Kiểm tra quyền sở hữu nhà trọ và phân quyền nhân viên cho MeterLog
     */
    private function authorizeMeterLogAction(string $action = 'view', ?MeterLog $meterLog = null)
    {
        $user = auth()->user();
        if ($meterLog) {
            $meterLog->loadMissing('room');
            if (!$user->managesHouse($meterLog->room->house_id)) {
                abort(403, 'Bạn không có quyền truy cập chỉ số điện nước này.');
            }
        }

        if ($user->role === 'staff') {
            if (!$user->hasPermission("meter_logs.{$action}")) {
                abort(403, 'Bạn không có quyền thực hiện thao tác này.');
            }
        }
    }

    /**
     * Hiển thị danh sách nhật ký chỉ số điện nước theo tháng/năm
     */
    public function index(Request $request)
    {
        $this->authorizeMeterLogAction('view');
        $user     = auth()->user();
        $houseIds = $user->getAccessibleHouseIds();

        $houses = House::whereIn('id', $houseIds)->withCount('rooms')->get();

        $rooms = Room::whereIn('house_id', $houseIds)
            ->with(['contract.renterRequest'])
            ->get();

        $meterLogs = MeterLog::with('room.contract.renterRequest')
            ->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'houses'    => $houses,
                'meterLogs' => $meterLogs,
                'rooms'     => $rooms,
            ]);
        }

        return Inertia::render('Landlord/MeterLogs/Index', [
            'houses'    => $houses,
            'meterLogs' => $meterLogs,
            'rooms'     => $rooms,
        ]);
    }

    /**
     * Hiển thị giao diện Form nhập chỉ số điện nước mới
     */
    public function create()
    {
        $this->authorizeMeterLogAction('create');

        $user     = auth()->user();
        $houseIds = $user->getAccessibleHouseIds();
        $rooms    = Room::whereIn('house_id', $houseIds)->get();

        return Inertia::render('Landlord/MeterLogs/Create', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Helper lấy chỉ số điện nước của tháng liền trước
     */
    private function getPreviousMeterLog($roomId, $month, $year)
    {
        $prevMonth = $month - 1;
        $prevYear = $year;
        if ($month == 1) {
            $prevMonth = 12;
            $prevYear = $year - 1;
        }

        return MeterLog::where('room_id', $roomId)
            ->where('month', $prevMonth)
            ->where('year', $prevYear)
            ->first();
    }

    /**
     * Lưu chỉ số điện nước mới (tự động tính chênh lệch sản lượng tiêu thụ kWh/m3)
     */
    public function store(Request $request)
    {
        $this->authorizeMeterLogAction('create');
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

        // KIỂM TRA CHỈ SỐ THÁNG TRƯỚC: Chỉ số mới không được nhỏ hơn chỉ số tháng trước
        $previousLog = $this->getPreviousMeterLog($validated['room_id'], $validated['month'], $validated['year']);
        if ($previousLog) {
            if ($validated['electric_reading'] < $previousLog->electric_reading) {
                return redirect()->back()->withInput()->with('error', "Chỉ số điện mới ({$validated['electric_reading']} kWh) không được nhỏ hơn chỉ số tháng trước ({$previousLog->electric_reading} kWh)!");
            }
            if ($validated['water_reading'] < $previousLog->water_reading) {
                return redirect()->back()->withInput()->with('error', "Chỉ số nước mới ({$validated['water_reading']} m³) không được nhỏ hơn chỉ số tháng trước ({$previousLog->water_reading} m³)!");
            }
        }

        // Tạo MeterLog và tính mức tiêu thụ
        $meterLog = new MeterLog($validated);
        $meterLog->calculateUsage();
        $meterLog->save();

        return redirect()->route('landlord.meter-logs.index')
            ->with('success', 'Thêm chỉ số điện nước thành công!');
    }

    /**
     * Nhập chỉ số điện nước hàng loạt cho tất cả các phòng cùng lúc
     */
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'readings' => 'required|array',
            'readings.*.room_id' => 'required|exists:rooms,id',
            'readings.*.electric_reading' => 'required|integer|min:0',
            'readings.*.water_reading' => 'required|integer|min:0',
            'readings.*.notes' => 'nullable|string',
        ]);

        $month = $validated['month'];
        $year = $validated['year'];

        // KIỂM TRA HÀNG LOẠT: Chỉ số mới không được nhỏ hơn tháng trước
        foreach ($validated['readings'] as $item) {
            $previousLog = $this->getPreviousMeterLog($item['room_id'], $month, $year);
            if ($previousLog) {
                if ($item['electric_reading'] < $previousLog->electric_reading) {
                    $room = Room::find($item['room_id']);
                    $roomName = $room ? $room->name : 'Phòng';
                    return redirect()->back()->withInput()->with('error', "Phòng {$roomName}: Chỉ số điện mới ({$item['electric_reading']} kWh) không được nhỏ hơn chỉ số tháng trước ({$previousLog->electric_reading} kWh)!");
                }
                if ($item['water_reading'] < $previousLog->water_reading) {
                    $room = Room::find($item['room_id']);
                    $roomName = $room ? $room->name : 'Phòng';
                    return redirect()->back()->withInput()->with('error', "Phòng {$roomName}: Chỉ số nước mới ({$item['water_reading']} m³) không được nhỏ hơn chỉ số tháng trước ({$previousLog->water_reading} m³)!");
                }
            }
        }

        $count = 0;

        foreach ($validated['readings'] as $item) {
            $meterLog = MeterLog::where('room_id', $item['room_id'])
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if (!$meterLog) {
                $meterLog = new MeterLog();
                $meterLog->room_id = $item['room_id'];
                $meterLog->month = $month;
                $meterLog->year = $year;
            }

            $meterLog->electric_reading = $item['electric_reading'];
            $meterLog->water_reading = $item['water_reading'];
            $meterLog->notes = $item['notes'] ?? null;
            $meterLog->calculateUsage();
            $meterLog->save();
            $count++;
        }

        return redirect()->route('landlord.meter-logs.index')
            ->with('success', "Đã ghi nhận thành công chỉ số điện nước cho {$count} phòng.");
    }

    /**
     * Xem chi tiết chỉ số và lịch sử tiêu thụ điện nước của phòng qua các tháng
     */
    public function show(MeterLog $meterLog)
    {
        $this->authorizeMeterLogAction('view', $meterLog);

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
     * Hiển thị giao diện Form chỉnh sửa chỉ số điện nước
     */
    public function edit(MeterLog $meterLog)
    {
        $this->authorizeMeterLogAction('edit', $meterLog);

        $meterLog->load('room');
        $rooms = Room::all();

        return Inertia::render('Landlord/MeterLogs/Edit', [
            'meterLog' => $meterLog,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Cập nhật chỉ số điện nước và tự động tính toán lại sản lượng tiêu thụ & Hóa đơn tương ứng
     */
    public function update(Request $request, MeterLog $meterLog)
    {
        $this->authorizeMeterLogAction('edit', $meterLog);
        $validated = $request->validate([
            'room_id'          => 'required|exists:rooms,id',
            'month'            => 'required|integer|min:1|max:12',
            'year'             => 'required|integer|min:2020',
            'electric_reading' => 'required|integer|min:0',
            'water_reading'    => 'required|integer|min:0',
            'notes'            => 'nullable|string',
        ]);

        // 1. Tìm hóa đơn tương ứng với chỉ số điện nước này
        $bill = \App\Models\Bill::where('room_id', $meterLog->room_id)
            ->where('month', $meterLog->month)
            ->where('year', $meterLog->year)
            ->first();

        // 2. Nếu hóa đơn đã được thanh toán ➔ BẢO VỆ DỮ LIỆU: KHÓA CHẶN KHÔNG CHO SỬA
        if ($bill && $bill->status === 'paid') {
            return redirect()->back()->with('error', 'Chỉ số điện nước tháng này thuộc Hóa đơn ĐÃ THANH TOÁN. Không thể chỉnh sửa!');
        }

        // KIỂM TRA CHỈ SỐ THÁNG TRƯỚC: Chỉ số mới không được nhỏ hơn chỉ số tháng trước
        $previousLog = $this->getPreviousMeterLog($validated['room_id'], $validated['month'], $validated['year']);
        if ($previousLog && $previousLog->id !== $meterLog->id) {
            if ($validated['electric_reading'] < $previousLog->electric_reading) {
                return redirect()->back()->withInput()->with('error', "Chỉ số điện mới ({$validated['electric_reading']} kWh) không được nhỏ hơn chỉ số tháng trước ({$previousLog->electric_reading} kWh)!");
            }
            if ($validated['water_reading'] < $previousLog->water_reading) {
                return redirect()->back()->withInput()->with('error', "Chỉ số nước mới ({$validated['water_reading']} m³) không được nhỏ hơn chỉ số tháng trước ({$previousLog->water_reading} m³)!");
            }
        }

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

        // 3. Nếu hóa đơn chưa thanh toán ➔ TỰ ĐỘNG ĐỒNG BỘ & TÍNH LẠI TIỀN TRONG HÓA ĐƠN
        if ($bill) {
            $billService = app(\App\Services\BillService::class);
            $billService->updateBillCosts($bill, [
                'electric_kwh' => $meterLog->electric_usage,
                'water_usage'  => $meterLog->water_usage,
            ]);
        }

        return redirect()->route('landlord.meter-logs.show', $meterLog->id)
            ->with('success', 'Cập nhật chỉ số thành công!' . ($bill ? ' Tiền điện nước trong Hóa đơn tương ứng đã được tự động tính lại.' : ''));
    }

    /**
     * Xóa chỉ số điện nước
     */
    public function destroy(MeterLog $meterLog)
    {
        $this->authorizeMeterLogAction('delete', $meterLog);

        // Tìm hóa đơn tương ứng với chỉ số điện nước này
        $bill = \App\Models\Bill::where('room_id', $meterLog->room_id)
            ->where('month', $meterLog->month)
            ->where('year', $meterLog->year)
            ->first();

        // Nếu hóa đơn đã được thanh toán ➔ BẢO VỆ DỮ LIỆU: KHÓA CHẶN KHÔNG CHO XÓA
        if ($bill && $bill->status === 'paid') {
            return redirect()->back()->with('error', 'Chỉ số điện nước này thuộc Hóa đơn ĐÃ THANH TOÁN. Không thể xóa!');
        }

        $meterLog->delete();

        return redirect()->route('landlord.meter-logs.index')
            ->with('success', 'Đã xóa chỉ số điện nước.');
    }
}
