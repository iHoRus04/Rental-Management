<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Bỏ qua kiểm tra đối với tài khoản Admin
            if ($user->role === 'admin') {
                return $next($request);
            }

            // Tự động đồng bộ trạng thái hết hạn gói cước của Landlord
            if ($user->role === 'landlord') {
                // Kiểm tra xem landlord đã thiết lập chuỗi nhà trọ chưa (nếu chưa thì đang ở Setup Wizard, bỏ qua check hết hạn gói)
                if ($user->houses()->count() > 0) {
                    $hasActiveSub = $user->activeSubscription()->exists();
                    if (!$hasActiveSub && $user->status === 'active') {
                        $user->update(['status' => 'expired']);
                    } elseif ($hasActiveSub && $user->status === 'expired') {
                        $user->update(['status' => 'active']);
                    }
                }
            }
            
            // Nếu tài khoản không ở trạng thái hoạt động (active)
            if ($user->status !== 'active') {
                // Loại trừ route account-status, logout và trang gia hạn subscription
                if (!$request->is('account-status') && 
                    !$request->routeIs('logout') && 
                    !$request->is('landlord/subscription') && 
                    !$request->is('landlord/subscription/*')
                ) {
                    return redirect()->route('account-status');
                }
            }
        }

        return $next($request);
    }
}
