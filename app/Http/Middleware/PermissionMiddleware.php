<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PermissionMiddleware
 *
 * Dùng trong route: ->middleware('permission:bills.create')
 * Kiểm tra xem user có quyền thực hiện action không.
 * Landlord luôn pass. Staff phải có quyền trong StaffRole của mình.
 */
class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        if (!$user->hasPermission($permission)) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                abort(403, 'Bạn không có quyền thực hiện thao tác này.');
            }
            return redirect()->route('landlord.dashboard')
                ->with('error', 'Bạn không có quyền thực hiện thao tác này.');
        }

        return $next($request);
    }
}
