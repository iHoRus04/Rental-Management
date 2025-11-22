<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReminderController extends Controller
{
    /**
     * Display a listing of reminders
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Reminder::with(['contract.renter', 'contract.room.house'])
            ->whereHas('contract.room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by status
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

        $reminders = $query->orderBy('reminder_date', 'asc')
                           ->paginate(15);

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
        $user = auth()->user();
        
        $contracts = Contract::with(['renter', 'room.house'])
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
            'type' => 'required|in:payment,contract_expiry',
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
        $this->authorizeReminder($reminder);

        $reminder->load(['contract.renter', 'contract.room.house']);

        return Inertia::render('Landlord/Reminders/Show', [
            'reminder' => $reminder,
        ]);
    }

    /**
     * Show the form for editing the specified reminder
     */
    public function edit(Reminder $reminder)
    {
        $this->authorizeReminder($reminder);

        $user = auth()->user();
        
        $contracts = Contract::with(['renter', 'room.house'])
            ->whereHas('room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'active')
            ->get();

        $reminder->load(['contract.renter', 'contract.room.house']);

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
            'type' => 'required|in:payment,contract_expiry',
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
        
        $count = Reminder::whereHas('contract.room.house', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('is_sent', false)
            ->where('reminder_date', '<=', now())
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Authorize that the reminder belongs to the current landlord
     */
    private function authorizeReminder(Reminder $reminder)
    {
        $user = auth()->user();
        
        $reminder->load('contract.room.house');
        
        if ($reminder->contract->room->house->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }
    }
}
