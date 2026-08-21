<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * ProfileController
     *
     * Quản lý trang thông tin người dùng (profile): hiển thị form, cập nhật
     * thông tin và xóa tài khoản. Các phương thức trả về Inertia views
     * hoặc RedirectResponse như phù hợp.
     */
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // RÀNG BUỘC BẢO VỆ DỮ LIỆU:
        // 1. Tài khoản Nhân viên do Chủ trọ quản lý, không cho tự xóa
        if ($user->role === 'staff') {
            return back()->withErrors(['password' => 'Tài khoản Nhân viên thuộc quyền quản lý của Chủ trọ. Vui lòng liên hệ Chủ trọ để thao tác.']);
        }

        // 2. Tài khoản Khách thuê đang có Hợp đồng hoạt động không được tự xóa
        if ($user->role === 'tenant') {
            $hasActiveContract = \App\Models\Contract::where('renter_request_id', $user->renter_request_id)
                ->where('status', 'active')
                ->exists();

            if ($hasActiveContract) {
                return back()->withErrors(['password' => 'Bạn đang có Hợp đồng thuê phòng đang hoạt động. Vui lòng liên hệ Chủ trọ thanh lý hợp đồng trước khi xóa tài khoản.']);
            }
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
