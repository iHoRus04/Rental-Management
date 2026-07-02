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
        Artisan::call('reminders:generate');

        $user     = auth()->user();
        $houseIds = $user->getAccessibleHouseIds();

        // Query houses with count of pending reminders
        $houses = \App\Models\House::whereIn('id', $houseIds)->withCount('rooms')->get()->map(function ($house) {
            $house->pending_reminders_count = \App\Models\Reminder::where('is_sent', false)
                ->where('reminder_date', '<=', now())
                ->whereHas('contract.room', function ($q) use ($house) {
                    $q->where('house_id', $house->id);
                })
                ->count();
            return $house;
        });

        $selectedHouse = null;
        if ($request->has('house_id') && $request->house_id !== 'all') {
            $selectedHouse = \App\Models\House::find($request->house_id);
        }

        $query = Reminder::with(['contract.renterRequest', 'contract.room.house', 'bill'])
            ->whereHas('contract.room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            });

        if ($request->has('house_id') && $request->house_id !== 'all') {
            $query->whereHas('contract.room', function ($q) use ($request) {
                $q->where('house_id', $request->house_id);
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_sent', false)->where('reminder_date', '<=', now());
            } elseif ($request->status === 'upcoming') {
                $query->where('is_sent', false)->where('reminder_date', '>', now());
            } elseif ($request->status === 'sent') {
                $query->where('is_sent', true);
            }
        }

        $reminders = $query->orderBy('reminder_date', 'desc')->paginate(15);

        if ($request->wantsJson()) {
            return response()->json([
                'reminders' => $reminders,
                'filters'   => $request->only(['type', 'status', 'house_id']),
                'houses'    => $houses,
                'selectedHouse' => $selectedHouse,
            ]);
        }

        return Inertia::render('Landlord/Reminders/Index', [
            'reminders' => $reminders,
            'filters'   => $request->only(['type', 'status', 'house_id']),
            'houses'    => $houses,
            'selectedHouse' => $selectedHouse,
        ]);
    }

    /**
     * Show the form for creating a new reminder
     */
    public function create()
    {
        $user     = auth()->user();
        $houseIds = $user->getAccessibleHouseIds();

        $contracts = Contract::with(['renterRequest', 'room.house'])
            ->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
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
        
        $houseIds = $user->getAccessibleHouseIds();
        
        $contracts = Contract::with(['renterRequest', 'room.house'])
            ->whereHas('room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
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
        $user     = auth()->user();
        $houseIds = $user->getAccessibleHouseIds();

        // 1. Số lượng nhắc nhở chưa gửi từ database
        $remindersCount = Reminder::whereHas('contract.room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->where('is_sent', false)
            ->where('reminder_date', '<=', now())
            ->count();

        $notifications = [];
        $totalCount = $remindersCount;

        // 2. Kiểm tra hạn gói cước của Landlord
        if ($user->role === 'landlord') {
            $activeSub = $user->activeSubscription()->with('package')->first();
            if ($activeSub) {
                $daysLeft = (int) ceil(now()->diffInDays($activeSub->end_date, false));
                if ($daysLeft <= 7) {
                    $totalCount++;
                    $notifications[] = [
                        'type' => 'subscription',
                        'title' => 'Gói cước sắp hết hạn',
                        'message' => $daysLeft <= 0 
                            ? "Gói cước \"{$activeSub->package->name}\" của bạn sẽ hết hạn vào hôm nay! Hãy gia hạn ngay."
                            : "Gói cước \"{$activeSub->package->name}\" của bạn sẽ hết hạn trong {$daysLeft} ngày nữa ({$activeSub->end_date->format('d/m/Y')}). Vui lòng gia hạn.",
                        'is_warning' => true,
                        'url' => route('landlord.subscription.index'),
                    ];
                }
            } else {
                // Kiểm tra xem có gói cước nào đã hết hạn trong lịch sử không
                $lastSub = \App\Models\Subscription::where('user_id', $user->id)
                    ->with('package')
                    ->orderBy('end_date', 'desc')
                    ->first();
                
                if ($lastSub) {
                    $totalCount++;
                    $notifications[] = [
                        'type' => 'subscription',
                        'title' => 'Gói cước đã hết hạn',
                        'message' => "Gói cước \"{$lastSub->package->name}\" của bạn đã hết hạn vào ngày {$lastSub->end_date->format('d/m/Y')}. Hãy gia hạn để tiếp tục sử dụng.",
                        'is_danger' => true,
                        'url' => route('landlord.subscription.index'),
                    ];
                }
            }
        }

        // Lấy 5 nhắc nhở chưa xử lý gần nhất để hiển thị nhanh dưới chuông
        $dbReminders = Reminder::with(['contract.renterRequest', 'contract.room.house'])
            ->whereHas('contract.room', function ($q) use ($houseIds) {
                $q->whereIn('house_id', $houseIds);
            })
            ->where('is_sent', false)
            ->where('reminder_date', '<=', now())
            ->orderBy('reminder_date', 'desc')
            ->limit(5)
            ->get();

        foreach ($dbReminders as $rem) {
            $typeLabel = 'Nhắc nhở';
            if ($rem->type === 'contract_expiry') $typeLabel = 'Hợp đồng sắp hết hạn';
            elseif ($rem->type === 'payment') $typeLabel = 'Thanh toán phòng';
            elseif ($rem->type === 'bill_creation') $typeLabel = 'Tạo hóa đơn';
            elseif ($rem->type === 'bill_payment') $typeLabel = 'Thanh toán hóa đơn';

            $notifications[] = [
                'id' => $rem->id,
                'type' => 'reminder',
                'title' => $typeLabel,
                'message' => $rem->message ?? "Bạn có nhắc nhở phòng {$rem->contract->room->name}.",
                'is_warning' => false,
                'url' => route('landlord.reminders.index'),
            ];
        }

        return response()->json([
            'count' => $totalCount,
            'notifications' => $notifications
        ]);
    }

    /**
     * Authorize that the reminder belongs to the current landlord
     */
    private function authorizeReminder(Reminder $reminder): void
    {
        $user = auth()->user();
        $reminder->load('contract.room.house');

        if (!$user->managesHouse($reminder->contract->room->house)) {
            abort(403, 'Unauthorized action.');
        }
    }
}
