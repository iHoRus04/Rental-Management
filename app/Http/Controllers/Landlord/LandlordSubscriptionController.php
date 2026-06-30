<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LandlordSubscriptionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // 1. Gói dịch vụ hiện tại
        $activeSub = $user->activeSubscription()->with('package')->first();
        
        $currentSubscription = null;
        if ($activeSub) {
            $currentSubscription = [
                'id' => $activeSub->id,
                'package_id' => $activeSub->package_id,
                'package_name' => $activeSub->package->name ?? 'N/A',
                'room_limit' => $activeSub->package->room_limit ?? 0,
                'price' => (float) $activeSub->price_paid,
                'start_date' => $activeSub->start_date->format('d/m/Y H:i'),
                'end_date' => $activeSub->end_date->format('d/m/Y H:i'),
                'days_left' => max(0, (int) Carbon::now()->diffInDays($activeSub->end_date, false)),
            ];
        }

        // 2. Thống kê quy mô phòng hiện tại
        $roomCount = $user->getCurrentRoomCount();
        $roomLimit = $user->getRoomLimit();

        // 3. Danh sách các gói cước đang mở bán
        $availablePackages = Package::where('is_active', true)->get();

        // 4. Lịch sử giao dịch
        $history = Subscription::where('user_id', $user->id)
            ->with('package')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'package_name' => $sub->package->name ?? 'N/A',
                    'price_paid' => (float) $sub->price_paid,
                    'start_date' => $sub->start_date->format('d/m/Y'),
                    'end_date' => $sub->end_date->format('d/m/Y'),
                    'status' => ($sub->status === 'active' && $sub->end_date->isFuture() && $sub->start_date->isPast()) 
                        ? 'active' 
                        : (($sub->status === 'active' && $sub->start_date->isFuture()) ? 'pending' : 'expired'),
                    'payment_status' => $sub->payment_status,
                    'created_at' => $sub->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Landlord/Subscription/Index', [
            'currentSubscription' => $currentSubscription,
            'roomCount' => $roomCount,
            'roomLimit' => $roomLimit,
            'packages' => $availablePackages,
            'history' => $history,
        ]);
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $user = auth()->user();
        $package = Package::find($validated['package_id']);

        if (!$package->is_active) {
            return redirect()->back()->with('error', 'Gói dịch vụ này hiện đang dừng mở bán.');
        }

        $roomCount = $user->getCurrentRoomCount();
        if ($package->room_limit < $roomCount) {
            return redirect()->back()->with('error', "Không thể thay đổi sang gói cước này vì số lượng phòng trọ hiện có của bạn ({$roomCount} phòng) đã vượt quá hạn mức tối đa của gói mới ({$package->room_limit} phòng). Vui lòng ẩn hoặc xóa bớt phòng trước khi đổi gói cước.");
        }

        // Lấy gói đang hoạt động của landlord
        $activeSub = $user->activeSubscription()->with('package')->first();

        // Cho phép nâng cấp (room_limit lớn hơn gói hiện hành) hoặc gia hạn (trùng package_id). Chặn hạ cấp.
        if ($activeSub && $activeSub->package_id != $package->id) {
            if ($package->room_limit <= $activeSub->package->room_limit) {
                return redirect()->back()->with('error', 'Bạn đang có một gói cước hoạt động. Bạn chỉ có thể nâng cấp lên gói cước lớn hơn, hoặc gia hạn gói cước hiện tại.');
            }
        }

        $startDate = Carbon::now();
        
        if ($activeSub) {
            if ($activeSub->package_id == $package->id) {
                // Gia hạn gói cũ: ngày bắt đầu là ngày hết hạn của gói cũ
                $startDate = Carbon::parse($activeSub->end_date);
                
                // Cập nhật trạng thái gói mới cộng dồn thời hạn
                $endDate = $this->calculateEndDate($startDate, $package);

                Subscription::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'price_paid' => $package->price,
                    'status' => 'active',
                    'payment_status' => 'paid',
                ]);
            } else {
                // Nâng cấp gói khác: hủy gói hiện tại và bắt đầu gói mới ngay lập tức
                $activeSub->update(['status' => 'expired']);

                $endDate = $this->calculateEndDate($startDate, $package);

                Subscription::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'price_paid' => $package->price,
                    'status' => 'active',
                    'payment_status' => 'paid',
                ]);
            }
        } else {
            // Đăng ký mới lần đầu
            $endDate = $this->calculateEndDate($startDate, $package);

            Subscription::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'price_paid' => $package->price,
                'status' => 'active',
                'payment_status' => 'paid',
            ]);
        }

        // Tự động kích hoạt trạng thái tài khoản của landlord sang active nếu đang ở pending/inactive
        if ($user->status !== 'active') {
            $user->update(['status' => 'active']);
        }

        return redirect()->route('landlord.subscription.index')
            ->with('success', "Đăng ký thành công gói cước {$package->name}! Hạn sử dụng của bạn đã được cập nhật.");
    }

    private function calculateEndDate($startDate, $package)
    {
        $endDate = $startDate->copy();
        $durationValue = $package->duration_value ?? 1;
        $durationType = $package->duration_type ?? 'month';
        
        if ($durationType === 'lifetime' || $durationType === 'onetime') {
            return $endDate->addYears(100);
        } elseif ($durationType === 'week') {
            return $endDate->addWeeks($durationValue);
        } elseif ($durationType === 'year') {
            return $endDate->addYears($durationValue);
        } else {
            return $endDate->addMonths($durationValue);
        }
    }
}
