<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * AuthenticatedSessionController
     *
     * Xử lý việc đăng nhập và đăng xuất cho user. Ghi nhớ session,
     * chuyển hướng dựa trên vai trò (`admin`/`landlord`) và dọn dẹp SSO tokens
     * khi logout.
     */
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
   public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return back()->withErrors([
                'email' => 'Email hoặc mật khẩu không đúng!',
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('landlord.dashboard');
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Remove any SSO tokens issued for this user
        if ($user) {
            $userKey = 'sso_user:'.$user->id;
            $tokens = Cache::pull($userKey, []);
            if (is_array($tokens)) {
                foreach ($tokens as $t) {
                    Cache::forget('sso:'.$t);
                }
            }
        }

        // Remove sso_token cookie on logout (in case it was set)
        Cookie::queue(Cookie::forget('sso_token'));

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
