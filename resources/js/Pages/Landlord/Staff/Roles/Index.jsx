import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

const MODULE_LABELS = {
    houses: 'Quản lý nhà trọ',
    rooms: 'Quản lý phòng',
    contracts: 'Hợp đồng',
    bills: 'Hóa đơn',
    payments: 'Thanh toán',
    meter_logs: 'Điện nước',
    renter_requests: 'Yêu cầu thuê',
    tenant_requests: 'Yêu cầu người thuê',
    reminders: 'Nhắc nhở',
    services: 'Dịch vụ',
    reports: 'Báo cáo',
};

const ACTION_LABELS = { view: 'Xem', create: 'Tạo', edit: 'Sửa', delete: 'Xóa' };
const REPORT_ONLY_VIEW = ['reports'];

// ─── Permission Matrix ────────────────────────────────────────────────────────
function PermissionMatrix({ permissions, onChange, readOnly = false }) {
    const modules = Object.keys(MODULE_LABELS);
    const permSet = new Set(permissions);

    const toggle = (perm) => {
        if (readOnly) return;
        const next = new Set(permSet);
        next.has(perm) ? next.delete(perm) : next.add(perm);
        onChange([...next]);
    };

    const toggleModule = (module) => {
        if (readOnly) return;
        const actions = REPORT_ONLY_VIEW.includes(module) ? ['view'] : Object.keys(ACTION_LABELS);
        const perms = actions.map(a => `${module}.${a}`);
        const allChecked = perms.every(p => permSet.has(p));
        const next = new Set(permSet);
        perms.forEach(p => allChecked ? next.delete(p) : next.add(p));
        onChange([...next]);
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Module</th>
                        {Object.entries(ACTION_LABELS).map(([action, label]) => (
                            <th key={action} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[72px]">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {modules.map(module => {
                        const actions = REPORT_ONLY_VIEW.includes(module) ? ['view'] : Object.keys(ACTION_LABELS);
                        const perms = actions.map(a => `${module}.${a}`);
                        const allChecked = perms.every(p => permSet.has(p));
                        const someChecked = perms.some(p => permSet.has(p));

                        return (
                            <tr key={module} className="hover:bg-emerald-50/40 transition-colors">
                                <td className="px-5 py-3">
                                    <label className={`flex items-center gap-2.5 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                            onChange={() => toggleModule(module)}
                                            disabled={readOnly}
                                            className="w-4 h-4 rounded accent-emerald-500"
                                        />
                                        <span className="font-semibold text-gray-700 text-sm">{MODULE_LABELS[module]}</span>
                                    </label>
                                </td>
                                {Object.keys(ACTION_LABELS).map(action => {
                                    const perm = `${module}.${action}`;
                                    const notApplicable = REPORT_ONLY_VIEW.includes(module) && action !== 'view';
                                    return (
                                        <td key={action} className="text-center px-4 py-3">
                                            {notApplicable ? (
                                                <span className="text-gray-200 text-lg select-none">—</span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={permSet.has(perm)}
                                                    onChange={() => toggle(perm)}
                                                    disabled={readOnly}
                                                    className={`w-4 h-4 rounded accent-emerald-500 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Role Card (left panel) ───────────────────────────────────────────────────
function RoleCard({ role, isSelected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${isSelected
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
        >
            <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {role.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {role.permissions?.length || 0} quyền
                </span>
            </div>
            {role.description && (
                <p className="text-xs text-gray-500 mb-1">{role.description}</p>
            )}
            <p className="text-[11px] text-gray-400">
                {role.staff_count} nhân viên đang dùng
            </p>
        </button>
    );
}

// ─── Create Form ──────────────────────────────────────────────────────────────
function CreateRoleForm({ onCancel }) {
    const [form, setForm] = useState({ name: '', description: '', permissions: [] });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('landlord.staff-roles.store'), form, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => onCancel(),
        });
    };

    const countSelected = form.permissions.length;
    const totalPerms = Object.keys(MODULE_LABELS).reduce((acc, m) =>
        acc + (REPORT_ONLY_VIEW.includes(m) ? 1 : Object.keys(ACTION_LABELS).length), 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Tên vai trò <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Ví dụ: Kế toán, Vận hành..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                    <input
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Mô tả ngắn..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Ma trận phân quyền</label>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                        {countSelected}/{totalPerms} đã chọn
                    </span>
                </div>
                <PermissionMatrix
                    permissions={form.permissions}
                    onChange={perms => setForm({ ...form, permissions: perms })}
                />
            </div>

            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                    {submitting ? 'Đang tạo...' : '✓ Tạo vai trò'}
                </button>
            </div>
        </form>
    );
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────
function EditRolePanel({ role, onClose }) {
    const [form, setForm] = useState({
        name: role.name,
        description: role.description || '',
        permissions: [...(role.permissions || [])],
    });
    const [submitting, setSubmitting] = useState(false);

    const handleUpdate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('landlord.staff-roles.update', role.id), form, {
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = () => {
        if (role.staff_count > 0) {
            alert(`Không thể xóa: vai trò này đang được ${role.staff_count} nhân viên sử dụng.`);
            return;
        }
        if (!confirm(`Xóa vai trò "${role.name}"?`)) return;
        router.delete(route('landlord.staff-roles.destroy', role.id));
    };

    const countSelected = form.permissions.length;
    const totalPerms = Object.keys(MODULE_LABELS).reduce((acc, m) =>
        acc + (REPORT_ONLY_VIEW.includes(m) ? 1 : Object.keys(ACTION_LABELS).length), 0);

    return (
        <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Tên vai trò <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                    <input
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Ma trận phân quyền</label>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                        {countSelected}/{totalPerms} đã chọn
                    </span>
                </div>
                <PermissionMatrix
                    permissions={form.permissions}
                    onChange={perms => setForm({ ...form, permissions: perms })}
                />
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 font-semibold text-sm transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa vai trò
                </button>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    >
                        {submitting ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesIndex({ roles }) {
    const { flash } = usePage().props;
    const [selectedRole, setSelectedRole] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase())
    );

    const currentRole = roles.find(r => r.id === selectedRole);

    const handleSelectRole = (id) => {
        setSelectedRole(id);
        setShowCreate(false);
    };

    const handleCreate = () => {
        setShowCreate(true);
        setSelectedRole(null);
    };

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans">
            <Head title="Quản lý Vai trò" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <a
                            href={route('landlord.staff.index')}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
                        >
                            ← Quản lý Nhân viên
                        </a>
                    </div>
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Vai trò & Phân quyền</h1>
                    <p className="text-emerald-600/80 font-medium text-sm mt-1">Tạo vai trò và thiết lập quyền truy cập cho nhân viên</p>
                </div>


            </div>

            {/* Flash messages */}
            {flash?.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-6">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-6">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {flash.error}
                </div>
            )}

            {/* Layout 2 cột */}
            <div className="flex gap-6 items-start">

                {/* LEFT: Danh sách roles */}
                <div className="w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Search roles */}
                        <div className="p-4 border-b border-gray-50">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm vai trò..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                                />
                            </div>
                        </div>

                        <div className="p-3 space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {filteredRoles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Chưa có vai trò nào</p>
                                    <p className="text-gray-400 text-xs mt-1">Nhấn "+ Tạo vai trò mới" để bắt đầu</p>
                                </div>
                            ) : (
                                filteredRoles.map(role => (
                                    <RoleCard
                                        key={role.id}
                                        role={role}
                                        isSelected={selectedRole === role.id && !showCreate}
                                        onClick={() => handleSelectRole(role.id)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Summary footer */}
                        {roles.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                                <p className="text-xs text-gray-400 font-medium">{roles.length} vai trò đã tạo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Detail / Edit / Create panel */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        {showCreate ? (
                            <>
                                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-teal-900">Tạo vai trò mới</h2>
                                        <p className="text-sm text-gray-500">Đặt tên và cấp quyền truy cập cho vai trò</p>
                                    </div>
                                </div>
                                <CreateRoleForm onCancel={() => setShowCreate(false)} />
                            </>
                        ) : currentRole ? (
                            <>
                                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-teal-900">{currentRole.name}</h2>
                                            <p className="text-sm text-gray-500">
                                                {currentRole.description || 'Chỉnh sửa tên, mô tả và danh sách quyền'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {currentRole.staff_count} nhân viên
                                    </span>
                                </div>
                                <EditRolePanel
                                    key={currentRole.id}
                                    role={currentRole}
                                    onClose={() => setSelectedRole(null)}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-teal-900 mb-1">Chọn vai trò để chỉnh sửa</h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">
                                    Chọn một vai trò từ danh sách bên trái hoặc tạo vai trò mới để bắt đầu thiết lập quyền.
                                </p>
                                <button
                                    onClick={handleCreate}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all"
                                >
                                    + Tạo vai trò đầu tiên
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

RolesIndex.layout = (page) => <AuthenticatedLayout children={page} />;
