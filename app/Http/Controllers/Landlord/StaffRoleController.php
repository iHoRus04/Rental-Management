<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\StaffRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * StaffRoleController
 *
 * Quản lý vai trò (roles) và phân quyền (permissions) cho staff.
 * Chỉ Landlord mới được truy cập.
 */
class StaffRoleController extends Controller
{
    /**
     * Danh sách roles + tất cả permissions định nghĩa sẵn
     */
    public function index()
    {
        $user = Auth::user();

        $roles = StaffRole::where('landlord_id', $user->id)
            ->with('rolePermissions')
            ->withCount('staff')
            ->latest()
            ->get()
            ->map(fn($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'description' => $role->description,
                'permissions' => $role->getPermissionsArray(),
                'staff_count' => $role->staff_count,
                'created_at'  => $role->created_at,
            ]);

        return Inertia::render('Landlord/Staff/Roles/Index', [
            'roles'          => $roles,
            'allPermissions' => StaffRole::allPermissions(),
            'modules'        => StaffRole::MODULES,
        ]);
    }

    /**
     * Tạo role mới
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', StaffRole::allPermissions()),
        ]);

        $user = Auth::user();

        $role = StaffRole::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'landlord_id' => $user->id,
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('success', "Đã tạo vai trò \"{$role->name}\" thành công!");
    }

    /**
     * Cập nhật role
     */
    public function update(Request $request, StaffRole $staffRole)
    {
        $this->authorizeRole($staffRole);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', StaffRole::allPermissions()),
        ]);

        $staffRole->update([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $staffRole->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', "Đã cập nhật vai trò \"{$staffRole->name}\"!");
    }

    /**
     * Xóa role (chỉ khi không có staff nào đang dùng)
     */
    public function destroy(StaffRole $staffRole)
    {
        $this->authorizeRole($staffRole);

        if ($staffRole->staff()->count() > 0) {
            return back()->with('error', 'Không thể xóa vai trò đang được gán cho nhân viên.');
        }

        $name = $staffRole->name;
        $staffRole->delete();

        return back()->with('success', "Đã xóa vai trò \"{$name}\"!");
    }

    /**
     * Gán role cho staff
     */
    public function assignToStaff(Request $request, User $staff)
    {
        $user = Auth::user();

        if ($staff->landlord_id !== $user->id || $staff->role !== 'staff') {
            abort(403, 'Không có quyền.');
        }

        $validated = $request->validate([
            'role_id' => 'nullable|exists:staff_roles,id',
        ]);

        // Xác nhận role thuộc về landlord này
        if (!empty($validated['role_id'])) {
            $role = StaffRole::where('id', $validated['role_id'])
                ->where('landlord_id', $user->id)
                ->firstOrFail();
        }

        $staff->update(['staff_role_id' => $validated['role_id'] ?? null]);

        return back()->with('success', 'Đã cập nhật vai trò cho nhân viên!');
    }

    /**
     * Kiểm tra role thuộc landlord đang đăng nhập
     */
    private function authorizeRole(StaffRole $role): void
    {
        if ($role->landlord_id !== Auth::id()) {
            abort(403, 'Bạn không có quyền quản lý vai trò này.');
        }
    }
}
