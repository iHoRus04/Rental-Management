import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ staff, houses, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        status: staff.status || 'active',
        password: '',
        password_confirmation: '',
        house_ids: staff.house_ids || [],
        staff_role_id: staff.staff_role_id || '',
    });

    const toggleHouse = (id) => {
        setData('house_ids', data.house_ids.includes(id)
            ? data.house_ids.filter(h => h !== id)
            : [...data.house_ids, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.staff.update', staff.id));
    };

    return (
        <div className="p-6 md:p-10 max-w-2xl mx-auto font-sans">
            <Head title={`Chỉnh sửa - ${staff.name}`} />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Chỉnh sửa nhân viên</h1>
                <p className="text-emerald-600/80 font-medium text-sm mt-1">{staff.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card: Thông tin cơ bản */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-700 border-b pb-3">Thông tin cơ bản</h2>

                    {/* Tên */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm dừng</option>
                            </select>
                        </div>
                    </div>

                    {/* Password (optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Để trống nếu không đổi"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Card: Vai trò */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-700 border-b pb-3 mb-4">Vai trò & Phân quyền</h2>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò</label>
                        <select
                            value={data.staff_role_id}
                            onChange={e => setData('staff_role_id', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                        >
                            <option value="">— Không có vai trò —</option>
                            {(roles || []).map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}{role.description ? ` — ${role.description}` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.staff_role_id && <p className="text-red-500 text-xs mt-1">{errors.staff_role_id}</p>}
                        <p className="text-xs text-gray-400 mt-1.5">
                            Chọn vai trò để cấp quyền thao tác cho nhân viên này.
                        </p>
                    </div>
                </div>

                {/* Card: Phân công nhà trọ */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-700 border-b pb-3 mb-4">Phân công nhà trọ</h2>
                    {houses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {houses.map(house => {
                                const checked = data.house_ids.includes(house.id);
                                return (
                                    <button
                                        key={house.id}
                                        type="button"
                                        onClick={() => toggleHouse(house.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                            checked
                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                                : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                            checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                                        }`}>
                                            {checked && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm">{house.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-4">Chưa có nhà trọ nào.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <a href={route('landlord.staff.index')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                        Hủy
                    </a>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-60"
                    >
                        {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;
