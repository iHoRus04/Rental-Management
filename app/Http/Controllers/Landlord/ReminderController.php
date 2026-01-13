<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * ReminderController
 *
 * Quản lý nhắc nhở (Reminders). Controller này tự động gọi command
 * `reminders:generate` để tạo các nhắc nhở (ví dụ: nhắc thanh toán, hợp đồng
 * sắp hết hạn) trước khi hiển thị danh sách. Hỗ trợ lọc theo loại và trạng thái.
 */
class ReminderController extends Controller
{
    /**
     * Display a listing of reminders
     */
    public function index(Request $request)
    {
        // NOTE: Hiện tại controller này gọi trực tiếp command để sinh reminder mới.
        // Điều này có nghĩa là mỗi lần user mở trang Reminders sẽ kích hoạt quá trình
        // sinh reminder (có thể tiêu tốn thời gian). Thay vì gọi trực tiếp ở đây,
        // cân nhắc chạy command qua scheduler hoặc dispatch job vào queue.
        Artisan::call('reminders:generate');

        // Lấy landlord hiện tại để giới hạn dữ liệu chỉ cho nhà của họ
        $user = auth()->user();

        // Bắt đầu build query: eager-load các relation cần thiết để tránh N+1
        $query = Reminder::with(['contract.renterRequest', 'contract.room.house', 'bill'])
            ->whereHas('contract.room.house', function ($q) use ($user) {
                // Chỉ lấy reminders thuộc về nhà của landlord đang đăng nhập
                $q->where('user_id', $user->id);
            });

        // Lọc theo loại reminder (payment, contract_expiry, ...)
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Lọc theo trạng thái: pending (chưa gửi và đến hạn), upcoming (chưa gửi và chưa đến), sent
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_sent', false)
                      ->where('reminder_date', '<=', now());
            } elseif ($request->status === 'upcoming') {
                $query->where('is_sent', false)
                      ->where('reminder_date', '>', now());
            } elseif ($request->status === 'sent') {
                $query->where('is_sent', true);
            }
        }

        // Sắp xếp theo ngày nhắc và phân trang
        $reminders = $query->orderBy('reminder_date', 'desc')
                           ->paginate(15);

        // Trả JSON khi client muốn, hoặc render Inertia page cho web UI
        if ($request->wantsJson()) {
            return response()->json([
                'reminders' => $reminders,
                'filters' => $request->only(['type', 'status']),
            ]);
        }

        return Inertia::render('Landlord/Reminders/Index', [
            'reminders' => $reminders,
            'filters' => $request->only(['type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new reminder
     */
    public function create()
    {
        // Chuẩn bị dữ liệu cho form tạo reminder: chỉ lấy hợp đồng active thuộc landlord
        $user = auth()->user();
        
        $contracts = Contract::with(['renterRequest', 'room.house'])
            ->whereHas('room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'active')
            ->get();

        return Inertia::render('Landlord/Reminders/Create', [
            'contracts' => $contracts,
        ]);
    }

    /**
     * Store a newly created reminder
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'bill_id' => 'nullable|exists:bills,id',
            'type' => 'required|in:payment,contract_expiry,bill_creation,bill_payment',
            'reminder_date' => 'required|date|after_or_equal:today',
            'message' => 'nullable|string',
        ]);

        Reminder::create($validated);

        return redirect()
            ->route('landlord.reminders.index')
            ->with('success', 'Nhắc nhở đã được tạo thành công!');
    }

    /**
     * Display the specified reminder
     */
    public function show(Reminder $reminder)
    {
        // Bảo đảm reminder thuộc về landlord đang đăng nhập
        $this->authorizeReminder($reminder);

        // Load các relation cần thiết để hiển thị chi tiết
        $reminder->load(['contract.renterRequest', 'contract.room.house']);

        return Inertia::render('Landlord/Reminders/Show', [
            'reminder' => $reminder,
        ]);
    }

    /**
     * Show the form for editing the specified reminder
     */
    public function edit(Reminder $reminder)
    {
        // Kiểm tra quyền sở hữu
        $this->authorizeReminder($reminder);

        // Lấy danh sách hợp đồng để có thể chuyển reminder sang hợp đồng khác khi edit
        $user = auth()->user();
        
        $contracts = Contract::with(['renterRequest', 'room.house'])
            ->whereHas('room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'active')
            ->get();

        // Load relation để hiển thị form edit đầy đủ thông tin
        $reminder->load(['contract.renterRequest', 'contract.room.house']);

        return Inertia::render('Landlord/Reminders/Edit', [
            'reminder' => $reminder,
            'contracts' => $contracts,
        ]);
    }

    /**
     * Update the specified reminder
     */
    public function update(Request $request, Reminder $reminder)
    {
        $this->authorizeReminder($reminder);

        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'bill_id' => 'nullable|exists:bills,id',
            'type' => 'required|in:payment,contract_expiry,bill_creation,bill_payment',
            'reminder_date' => 'required|date',
            'message' => 'nullable|string',
        ]);

        $reminder->update($validated);

        return redirect()
            ->route('landlord.reminders.index')
            ->with('success', 'Nhắc nhở đã được cập nhật!');
    }

    /**
     * Mark reminder as sent
     */
    public function markAsSent(Reminder $reminder)
    {
        $this->authorizeReminder($reminder);
        // Đánh dấu nhắc nhở là đã gửi (cập nhật cờ is_sent và thời gian gửi nếu cần)
        $reminder->markAsSent();

        return back()->with('success', 'Đã đánh dấu nhắc nhở là đã gửi!');
    }

    /**
     * Remove the specified reminder
     */
    public function destroy(Reminder $reminder)
    {
        $this->authorizeReminder($reminder);

        $reminder->delete();

        return redirect()
            ->route('landlord.reminders.index')
            ->with('success', 'Nhắc nhở đã được xóa!');
    }

    /**
     * Get pending reminders count for dashboard
     */
    public function getPendingCount()
    {
        $user = auth()->user();
        
        // Count reminders that have not been sent yet (is_sent = false)
        // Do not filter by reminder_date so badge shows all unsent notifications
        $count = Reminder::whereHas('contract.room.house', function ($q) use ($user) {
            $q->where('user_id', $user->id);
            })
            ->where('is_sent', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Authorize that the reminder belongs to the current landlord
     */
    private function authorizeReminder(Reminder $reminder)
    {
        $user = auth()->user();
        
        // Load relation để kiểm tra quyền sở hữu (thuộc landlord nào)
        $reminder->load('contract.room.house');
        
        // Nếu reminder không thuộc nhà của user đang đăng nhập => abort 403
        if ($reminder->contract->room->house->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }
    }
}
