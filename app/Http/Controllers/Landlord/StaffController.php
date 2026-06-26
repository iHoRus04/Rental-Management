<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\StaffRole;
use App\Models\User;
use App\Models\House;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

/**
 * StaffController
 *
 * CRUD nhân viên (staff) do landlord quản lý.
 * - Chỉ landlord mới được truy cập (route đã bảo vệ bằng middleware).
 * - Staff được tạo với landlord_id = id của landlord đang đăng nhập.
 * - Hỗ trợ gán/bỏ nhà trọ cho staff.
 */
class StaffController extends Controller
{
    /**
     * Danh sách nhân viên của landlord hiện tại
     */
    public function index()
    {
        $user = Auth::user();

        $staffList = User::where('landlord_id', $user->id)
            ->where('role', 'staff')
            ->with(['staffedHouses', 'staffRole.rolePermissions'])
            ->latest()
            ->get()
            ->map(function ($staff) {
                return [
                    'id'            => $staff->id,
                    'name'          => $staff->name,
                    'email'         => $staff->email,
                    'phone'         => $staff->phone,
                    'status'        => $staff->status,
                    'created_at'    => $staff->created_at,
                    'staff_role_id' => $staff->staff_role_id,
                    'staffRole'     => $staff->staffRole ? [
                        'id'   => $staff->staffRole->id,
                        'name' => $staff->staffRole->name,
                    ] : null,
                    'houses'        => $staff->staffedHouses->map(fn($h) => [
                        'id'   => $h->id,
                        'name' => $h->name,
                    ]),
                ];
            });

        $houses = House::where('user_id', $user->id)->get(['id', 'name']);
        $roles  = StaffRole::where('landlord_id', $user->id)->get(['id', 'name', 'description']);

        return Inertia::render('Landlord/Staff/Index', [
            'staffList' => $staffList,
            'houses'    => $houses,
            'roles'     => $roles,
        ]);
    }

    /**
     * Form tạo nhân viên mới
     */
    public function create()
    {
        $user   = Auth::user();
        $houses = House::where('user_id', $user->id)->get(['id', 'name']);
        $roles  = StaffRole::where('landlord_id', $user->id)->get(['id', 'name', 'description']);

        return Inertia::render('Landlord/Staff/Create', [
            'houses' => $houses,
            'roles'  => $roles,
        ]);
    }

    /**
     * Lưu nhân viên mới
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email|max:255',
            'phone'         => 'nullable|string|max:20',
            'password'      => 'required|string|min:8|confirmed',
            'house_ids'     => 'nullable|array',
            'house_ids.*'   => 'exists:houses,id',
            'staff_role_id' => 'nullable|exists:staff_roles,id',
        ]);

        $user = Auth::user();

        $staff = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'password'       => Hash::make($validated['password']),
            'plain_password' => $validated['password'],
            'role'           => 'staff',
            'status'         => 'active',
            'landlord_id'    => $user->id,
            'staff_role_id'  => $validated['staff_role_id'] ?? null,
        ]);

        // Gán nhà trọ nếu có
        if (!empty($validated['house_ids'])) {
            // Đảm bảo landlord sở hữu các nhà này
            $validHouseIds = House::where('user_id', $user->id)
                ->whereIn('id', $validated['house_ids'])
                ->pluck('id')
                ->toArray();

            $syncData = [];
            foreach ($validHouseIds as $houseId) {
                $syncData[$houseId] = ['assigned_at' => now()];
            }
            $staff->staffedHouses()->sync($syncData);
        }

        return redirect()->route('landlord.staff.index')
            ->with('success', 'Tạo nhân viên thành công! Email: ' . $staff->email);
    }

    /**
     * Xem chi tiết nhân viên
     */
    public function show(User $staff)
    {
        $this->authorizeStaff($staff);

        $staff->load('staffedHouses');
        $user   = Auth::user();
        $houses = House::where('user_id', $user->id)->get(['id', 'name']);

        return Inertia::render('Landlord/Staff/Show', [
            'staff'  => [
                'id'             => $staff->id,
                'name'           => $staff->name,
                'email'          => $staff->email,
                'phone'          => $staff->phone,
                'status'         => $staff->status,
                'created_at'     => $staff->created_at,
                'staff_role_id'  => $staff->staff_role_id,
                'plain_password' => $staff->plain_password,
                'staffRole'      => $staff->staffRole ? [
                    'id'          => $staff->staffRole->id,
                    'name'        => $staff->staffRole->name,
                    'permissions' => $staff->staffRole->load('rolePermissions')->getPermissionsArray(),
                ] : null,
                'houses'     => $staff->staffedHouses->map(fn($h) => [
                    'id'          => $h->id,
                    'name'        => $h->name,
                    'assigned_at' => $h->pivot->assigned_at,
                ]),
            ],
            'houses' => $houses,
            'roles'  => StaffRole::where('landlord_id', Auth::id())->get(['id', 'name']),
        ]);
    }

    /**
     * Form chỉnh sửa nhân viên
     */
    public function edit(User $staff)
    {
        $this->authorizeStaff($staff);

        $staff->load('staffedHouses');
        $user   = Auth::user();
        $houses = House::where('user_id', $user->id)->get(['id', 'name']);

        return Inertia::render('Landlord/Staff/Edit', [
            'staff'  => [
                'id'            => $staff->id,
                'name'          => $staff->name,
                'email'         => $staff->email,
                'phone'         => $staff->phone,
                'status'        => $staff->status,
                'staff_role_id' => $staff->staff_role_id,
                'house_ids'     => $staff->staffedHouses->pluck('id')->toArray(),
            ],
            'houses' => $houses,
            'roles'  => StaffRole::where('landlord_id', Auth::id())->get(['id', 'name', 'description']),
        ]);
    }

    /**
     * Cập nhật thông tin nhân viên
     */
    public function update(Request $request, User $staff)
    {
        $this->authorizeStaff($staff);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|max:255|unique:users,email,' . $staff->id,
            'phone'         => 'nullable|string|max:20',
            'status'        => 'required|in:active,inactive',
            'password'      => 'nullable|string|min:8|confirmed',
            'house_ids'     => 'nullable|array',
            'house_ids.*'   => 'exists:houses,id',
            'staff_role_id' => 'nullable|exists:staff_roles,id',
        ]);

        $user = Auth::user();

        $updateData = [
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'phone'         => $validated['phone'] ?? null,
            'status'        => $validated['status'],
            'staff_role_id' => $validated['staff_role_id'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $updateData['password']       = Hash::make($validated['password']);
            $updateData['plain_password'] = $validated['password'];
        }

        $staff->update($updateData);

        // Cập nhật gán nhà trọ
        $houseIds = $validated['house_ids'] ?? [];

        if (!empty($houseIds)) {
            $validHouseIds = House::where('user_id', $user->id)
                ->whereIn('id', $houseIds)
                ->pluck('id')
                ->toArray();

            $syncData = [];
            foreach ($validHouseIds as $houseId) {
                $syncData[$houseId] = ['assigned_at' => now()];
            }
            $staff->staffedHouses()->sync($syncData);
        } else {
            $staff->staffedHouses()->detach();
        }

        return redirect()->route('landlord.staff.index')
            ->with('success', 'Cập nhật nhân viên thành công!');
    }

    /**
     * Xóa nhân viên
     */
    public function destroy(User $staff)
    {
        $this->authorizeStaff($staff);

        // Gỡ tất cả nhà trọ đã gán
        $staff->staffedHouses()->detach();
        $staff->delete();

        return redirect()->route('landlord.staff.index')
            ->with('success', 'Đã xóa nhân viên!');
    }

    /**
     * Gán nhà trọ cho nhân viên
     */
    public function assignHouse(Request $request, User $staff)
    {
        $this->authorizeStaff($staff);

        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
        ]);

        $user = Auth::user();

        // Kiểm tra landlord sở hữu nhà này
        $house = House::where('id', $validated['house_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Gán nếu chưa có
        if (!$staff->staffedHouses()->where('house_id', $house->id)->exists()) {
            $staff->staffedHouses()->attach($house->id, ['assigned_at' => now()]);
        }

        return back()->with('success', 'Đã gán nhà trọ cho nhân viên!');
    }

    /**
     * Gỡ nhà trọ khỏi nhân viên
     */
    public function removeHouse(User $staff, House $house)
    {
        $this->authorizeStaff($staff);

        $staff->staffedHouses()->detach($house->id);

        return back()->with('success', 'Đã gỡ nhà trọ khỏi nhân viên!');
    }

    /**
     * Đổi mật khẩu nhân viên (từ trang Show)
     */
    public function changePassword(Request $request, User $staff)
    {
        $this->authorizeStaff($staff);

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff->update([
            'password'       => Hash::make($request->password),
            'plain_password' => $request->password,
        ]);

        return back()->with('success', 'Đã đổi mật khẩu cho nhân viên thành công!');
    }

    /**
     * Kiểm tra staff thuộc landlord đang đăng nhập
     */
    private function authorizeStaff(User $staff): void
    {
        if ($staff->landlord_id !== Auth::id() || $staff->role !== 'staff') {
            abort(403, 'Bạn không có quyền quản lý nhân viên này.');
        }
    }
}
