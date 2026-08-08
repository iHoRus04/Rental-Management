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
    /**
     * Display the subscription management dashboard for the landlord.
     * =========================================================================
     * CHỨC NĂNG: Hiển thị màn hình Quản lý Gói dịch vụ của Chủ trọ
     * 1. Lấy thông tin gói dịch vụ hiện tại đang hoạt động kèm số ngày còn lại.
     * 2. Thống kê quy mô phòng trọ thực tế hiện có so với hạn mức tối đa của gói.
     * 3. Lấy danh sách các gói cước đang mở bán (loại trừ các gói dùng thử 1 lần đã đăng ký).
     * 4. Lịch sử giao dịch mua gói cước của Chủ trọ.
     * =========================================================================
     */
    public function index()
    {
        $user = auth()->user();
        
        // ---------------------------------------------------------------------
        // BƯỚC 1: Lấy gói dịch vụ hiện tại đang hoạt động của Chủ trọ
        // ---------------------------------------------------------------------
        $activeSub = $user->activeSubscription()->with('package')->first();
        
        $currentSubscription = null;
        if ($activeSub) {
            $currentSubscription = [
                'id'           => $activeSub->id,
                'package_id'   => $activeSub->package_id,
                'package_name' => $activeSub->package->name ?? 'N/A',
                'room_limit'   => $activeSub->package->room_limit ?? 0,
                'price'        => (float) $activeSub->price_paid,
                'start_date'   => $activeSub->start_date->format('d/m/Y H:i'),
                'end_date'     => $activeSub->end_date->format('d/m/Y H:i'),
                'days_left'    => max(0, (int) Carbon::now()->diffInDays($activeSub->end_date, false)),
            ];
        }

        // ---------------------------------------------------------------------
        // BƯỚC 2: Thống kê số lượng phòng trọ thực tế và hạn mức phòng tối đa
        // ---------------------------------------------------------------------
        $roomCount = $user->getCurrentRoomCount();
        $roomLimit = $user->getRoomLimit();

        // ---------------------------------------------------------------------
        // BƯỚC 3: Lấy các gói cước mở bán (Lọc bỏ các gói sài 1 lần/dùng thử đã từng đăng ký)
        // ---------------------------------------------------------------------
        $registeredOnetimePackageIds = Subscription::where('user_id', $user->id)
            ->whereHas('package', function ($query) {
                $query->where('duration_type', 'onetime');
            })
            ->pluck('package_id')
            ->toArray();

        $availablePackages = Package::where('is_active', true)
            ->where(function ($query) use ($registeredOnetimePackageIds) {
                $query->whereNotIn('id', $registeredOnetimePackageIds)
                      ->orWhere('duration_type', '!=', 'onetime');
            })
            ->get();

        // ---------------------------------------------------------------------
        // BƯỚC 4: Lấy danh sách lịch sử tất cả giao dịch đăng ký gói của Chủ trọ
        // ---------------------------------------------------------------------
        $history = Subscription::where('user_id', $user->id)
            ->with('package')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id'             => $sub->id,
                    'package_name'   => $sub->package->name ?? 'N/A',
                    'price_paid'     => (float) $sub->price_paid,
                    'start_date'     => $sub->start_date->format('d/m/Y'),
                    'end_date'       => $sub->end_date->format('d/m/Y'),
                    'status'         => ($sub->status === 'active' && $sub->end_date->isFuture() && $sub->start_date->isPast()) 
                        ? 'active' 
                        : (($sub->status === 'active' && $sub->start_date->isFuture()) ? 'pending' : 'expired'),
                    'payment_status' => $sub->payment_status,
                    'created_at'     => $sub->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Landlord/Subscription/Index', [
            'currentSubscription' => $currentSubscription,
            'roomCount'           => $roomCount,
            'roomLimit'           => $roomLimit,
            'packages'            => $availablePackages,
            'history'             => $history,
        ]);
    }

    /**
     * Process subscription / upgrade / renewal of a service package.
     * =========================================================================
     * CHỨC NĂNG: Xử lý Đăng ký mới, Nâng cấp hoặc Gia hạn Gói cước Dịch vụ
     * 
     * QUY TRÌNH KIỂM TRA BẢO VỆ NGHỆ PHÁP:
     * - Kiểm tra 1: Gói cước phải còn đang được mở bán (`is_active`).
     * - Kiểm tra 2: Chặn nếu số phòng trọ thực tế hiện có vượt quá hạn mức gói mới.
     * - Kiểm tra 3 (Chặn hạ cấp): Nếu đang có gói còn hạn, chỉ cho phép GIA HẠN
     *   hoặc NÂNG CẤP lên gói lớn hơn. Chặn đăng ký gói nhỏ hơn gói hiện tại.
     * 
     * QUY TRÌNH XỬ LÝ LƯU KẾT QUẢ:
     * - Gia hạn gói cũ: Ngày bắt đầu nối tiếp từ ngày hết hạn gói cũ (cộng dồn).
     * - Nâng cấp gói mới: Hủy gói cũ (`status = expired`) và kích hoạt gói mới ngay.
     * - Tự động kích hoạt trạng thái tài khoản Chủ trọ sang `active` nếu đang bị khóa/chờ duyệt.
     * =========================================================================
     */
    public function subscribe(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $user = auth()->user();
        $package = Package::find($validated['package_id']);

        // ---------------------------------------------------------------------
        // KIỂM TRA 1: Đảm bảo gói dịch vụ này đang mở bán
        // ---------------------------------------------------------------------
        if (!$package->is_active) {
            return redirect()->back()->with('error', 'Gói dịch vụ này hiện đang dừng mở bán.');
        }

        // ---------------------------------------------------------------------
        // KIỂM TRA 2: Đảm bảo số phòng trọ thực tế không vượt quá hạn mức gói mới
        // ---------------------------------------------------------------------
        $roomCount = $user->getCurrentRoomCount();
        if ($package->room_limit < $roomCount) {
            return redirect()->back()->with('error', "Không thể thay đổi sang gói cước này vì số lượng phòng trọ hiện có của bạn ({$roomCount} phòng) đã vượt quá hạn mức tối đa của gói mới ({$package->room_limit} phòng). Vui lòng ẩn hoặc xóa bớt phòng trước khi đổi gói cước.");
        }

        // Lấy gói đang hoạt động hoặc gói sắp tới có hạn sử dụng xa nhất trong tương lai
        $latestSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->orderBy('end_date', 'desc')
            ->first();

        // Lấy gói active hiện tại để kiểm tra phân quyền
        $activeSub = $user->activeSubscription()->with('package')->first() ?? $latestSub;

        // ---------------------------------------------------------------------
        // KIỂM TRA 3 (Chặn hạ cấp): 
        // Cho phép nâng cấp (room_limit gói mới > gói hiện tại) hoặc gia hạn (trùng package_id). Chặn hạ cấp.
        // ---------------------------------------------------------------------
        if ($activeSub && $activeSub->package_id != $package->id) {
            if ($package->room_limit <= $activeSub->package->room_limit) {
                return redirect()->back()->with('error', 'Bạn đang có một gói cước hoạt động. Bạn chỉ có thể nâng cấp lên gói cước lớn hơn, hoặc gia hạn gói cước hiện tại.');
            }
        }

        $startDate = Carbon::now();
        
        // ---------------------------------------------------------------------
        // XỬ LÝ LƯU GIAO DỊCH VÀ KÍCH HOẠT GÓI CỘNG DỒN NỐI ĐUÔI
        // ---------------------------------------------------------------------
        if ($latestSub) {
            if ($latestSub->package_id == $package->id) {
                // Trường hợp A: GIA HẠN GÓI CŨ (Cho phép bấm Gia hạn nhiều lần liên tiếp)
                // Ngày bắt đầu gói mới nối tiếp từ ngày hết hạn xa nhất của gói trước đó (Cộng dồn nối đuôi)
                $startDate = Carbon::parse($latestSub->end_date);
                $endDate   = $this->calculateEndDate($startDate, $package);

                Subscription::create([
                    'user_id'        => $user->id,
                    'package_id'     => $package->id,
                    'start_date'     => $startDate,
                    'end_date'       => $endDate,
                    'price_paid'     => $package->price,
                    'status'         => 'active',
                    'payment_status' => 'paid',
                ]);
            } else {
                // Trường hợp B: NÂNG CẤP SANG GÓI MỚI CAO HƠN
                // Hủy toàn bộ các gói cũ và kích hoạt gói nâng cấp mới ngay lập tức
                Subscription::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->update(['status' => 'expired']);

                $endDate = $this->calculateEndDate($startDate, $package);

                Subscription::create([
                    'user_id'        => $user->id,
                    'package_id'     => $package->id,
                    'start_date'     => $startDate,
                    'end_date'       => $endDate,
                    'price_paid'     => $package->price,
                    'status'         => 'active',
                    'payment_status' => 'paid',
                ]);
            }
        } else {
            // Trường hợp C: ĐĂNG KÝ GÓI LẦN ĐẦU
            $endDate = $this->calculateEndDate($startDate, $package);

            Subscription::create([
                'user_id'        => $user->id,
                'package_id'     => $package->id,
                'start_date'     => $startDate,
                'end_date'       => $endDate,
                'price_paid'     => $package->price,
                'status'         => 'active',
                'payment_status' => 'paid',
            ]);
        }

        // Tự động chuyển trạng thái tài khoản Chủ trọ sang 'active' nếu đang ở dạng pending/inactive
        if ($user->status !== 'active') {
            $user->update(['status' => 'active']);
        }

        return redirect()->route('landlord.subscription.index')
            ->with('success', "Đăng ký thành công gói cước {$package->name}! Hạn sử dụng của bạn đã được cập nhật.");
    }

    /**
     * Helper method to calculate end date based on package duration configuration.
     * =========================================================================
     * CHỨC NĂNG: Hàm trợ giúp tính toán ngày hết hạn dựa theo cấu hình gói cước
     * (onetime, week, month, year, lifetime).
     * =========================================================================
     */
    private function calculateEndDate($startDate, $package)
    {
        $endDate       = $startDate->copy();
        $durationValue = $package->duration_value ?? 1;
        $durationType  = $package->duration_type ?? 'month';
        
        if ($durationType === 'onetime') {
            return $endDate->addDays($durationValue);
        } elseif ($durationType === 'lifetime') {
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

