<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cookie;
use App\Models\User;

class SsoController extends Controller
{
    /**
     * SSO helper controller
     *
     * Tạo và xác thực token tạm thời (SSO) giữa các ứng dụng trên cùng host.
     * - `createToken()` tạo token ngắn hạn và trả về cookie cho client.
     * - `validateToken()` được gọi bởi ứng dụng bên ngoài để kiểm tra và tiêu token.
     */
    // Create a short-lived token for SSO and return it
    public function createToken(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $token = Str::random(64);
        // store mapping token -> user id for 5 minutes
        $ttl = now()->addMinutes(5);
        Cache::put('sso:'.$token, $user->id, $ttl);

        // maintain reverse index user -> [tokens] to allow cleanup on logout
        $userKey = 'sso_user:'.$user->id;
        $tokens = Cache::get($userKey, []);
        $tokens[] = $token;
        Cache::put($userKey, $tokens, $ttl);

        // Create a cookie so client (and other apps on same host) can receive it.
        // Note: cookie() args: name, value, minutes, path, domain, secure, httpOnly
        // We set httpOnly=false so client JS or the opened external app can read it if required.
        $cookie = cookie('sso_token', $token, 5, '/', 'localhost', false, false);

        return response()->json(['token' => $token])->cookie($cookie);
    }

    // Validate token (called by external app) and return basic user info, then consume token
    public function validateToken($token)
    {
        $key = 'sso:'.$token;
        if (!Cache::has($key)) {
            return response()->json(['valid' => false], 404);
        }

        $userId = Cache::pull($key); // consume token
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['valid' => false], 404);
        }

        return response()->json([
            'valid' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
