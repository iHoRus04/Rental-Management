<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Feedback;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $settingsPath = 'settings.json';
        $systemSettings = [
            'app_name' => 'DreamHouses',
            'logo' => null,
            'support_phone' => '0987654321',
            'support_email' => 'support@dreamhouses.vn',
            'support_address' => '123 Đường Láng, Đống Đa, Hà Nội',
        ];

        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($settingsPath)) {
            $content = \Illuminate\Support\Facades\Storage::disk('local')->get($settingsPath);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $systemSettings = array_merge($systemSettings, $decoded);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user'        => $user,
                'permissions' => $user ? $user->getStaffPermissions() : [],
            ],
            'csrf_token' => $request->session()->token(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
            ],
            // Badge thông báo góp ý chưa xử lý — chỉ tính khi user là admin
            'pendingFeedbacksCount' => fn () => ($user && $user->role === 'admin')
                ? Feedback::where('status', 'pending')->count()
                : 0,
            'systemSettings' => $systemSettings,
        ];
    }
}
