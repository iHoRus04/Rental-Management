import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Show({ staff, houses }) {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState({ show: false, houseId: null });

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleAssignHouse = (houseId) => {
        router.post(route('landlord.staff.houses.assign', staff.id), { house_id: houseId });
    };

    const handleRemoveHouse = (houseId) => {
        setConfirmRemove({ show: true, houseId });
    };

    const executeRemove = () => {
        router.delete(route('landlord.staff.houses.remove', { staff: staff.id, house: confirmRemove.houseId }), {
            onFinish: () => setConfirmRemove({ show: false, houseId: null }),
        });
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        post(route('landlord.staff.change-password', staff.id), {
            onSuccess: () => reset(),
        });
    };

    const assignedIds = staff.houses ? staff.houses.map(h => h.id) : [];
    const unassigned = houses.filter(h => !assignedIds.includes(h.id));

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans">
            <Head title={`Nhân viên - ${staff.name}`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                        {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-teal-900">{staff.name}</h1>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                    </div>
                </div>
                <Link
                    href={route('landlord.staff.edit', staff.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition border border-emerald-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CỘT TRÁI: Thông tin + Đổi mật khẩu */}
                <div className="space-y-4">

                    {/* Card: Thông tin */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin</h2>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Số điện thoại</p>
                            <p className="text-sm font-semibold text-gray-800">{staff.phone || '—'}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Trạng thái</p>
                            {staff.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Hoạt động
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                    Tạm dừng
                                </span>
                            )}
                        </div>

                        {staff.staffRole && (
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Vai trò</p>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    {staff.staffRole.name}
                                </span>
                            </div>
                        )}

                        {/* Mật khẩu hiện tại */}
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Mật khẩu tài khoản</p>
                            {staff.plain_password ? (
                                <div className="flex items-center gap-2">
                                    <code className={`flex-1 text-sm font-mono px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-gray-800 select-all ${showPass ? '' : 'tracking-widest'}`}>
                                        {showPass ? staff.plain_password : '••••••••'}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                                        title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showPass ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Chưa có thông tin (đổi mật khẩu bên dưới để lưu)</p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Ngày tạo</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {new Date(staff.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Card: Đổi mật khẩu */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Đổi mật khẩu</h2>

                        {recentlySuccessful && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium mb-4">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Đổi mật khẩu thành công!
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-3">
                            {/* Mật khẩu mới */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Mật khẩu mới <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Tối thiểu 8 ký tự"
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPass ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Xác nhận mật khẩu */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Xác nhận</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Nhập lại mật khẩu"
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.password}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI: Nhà trọ được phân công */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">
                            Nhà trọ được phân công ({staff.houses?.length || 0})
                        </h2>

                        {staff.houses && staff.houses.length > 0 ? (
                            <div className="space-y-2">
                                {staff.houses.map(house => (
                                    <div key={house.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span className="text-sm font-semibold text-emerald-800">{house.name}</span>
                                            {house.assigned_at && (
                                                <span className="text-xs text-emerald-500">
                                                    • {new Date(house.assigned_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveHouse(house.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition"
                                            title="Gỡ phân công"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Chưa phân công nhà trọ nào</p>
                        )}
                    </div>

                    {/* Thêm nhà trọ */}
                    {unassigned.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Thêm phân công</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {unassigned.map(house => (
                                    <button
                                        key={house.id}
                                        onClick={() => handleAssignHouse(house.id)}
                                        className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 text-sm font-medium transition text-left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        {house.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Back */}
            <div className="mt-6">
                <Link
                    href={route('landlord.staff.index')}
                    className="text-sm text-gray-500 hover:text-emerald-600 transition font-medium"
                >
                    ← Quay lại danh sách
                </Link>
            </div>
            <ConfirmModal
                show={confirmRemove.show}
                onClose={() => setConfirmRemove({ show: false, houseId: null })}
                onConfirm={executeRemove}
                title="Gỡ phân công"
                message="Bỏ phân công nhà trọ này cho nhân viên?"
                confirmText="Gỡ phân công"
                type="danger"
            />
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;
