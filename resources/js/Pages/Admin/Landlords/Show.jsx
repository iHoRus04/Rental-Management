import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

// Icons
const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);
const HouseIcon = () => (
    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const RoomIcon = () => (
    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const MoneyIcon = () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const formatVND = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

export default function Show({ landlord, houses, subscriptions, stats }) {
    const [statusLoading, setStatusLoading] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState({ show: false, newStatus: null });

    const handleStatusChange = (newStatus) => {
        setConfirmStatus({ show: true, newStatus });
    };

    const executeStatusChange = () => {
        const newStatus = confirmStatus.newStatus;
        setStatusLoading(true);
        router.post(route('admin.landlords.update-status', landlord.id), { status: newStatus }, {
            onFinish: () => {
                setStatusLoading(false);
                setConfirmStatus({ show: false, newStatus: null });
            }
        });
    };

    return (
        <AdminLayout title="Chi tiết Chủ trọ">
            <Head title={`Chủ trọ: ${landlord.name}`} />

            <div className="space-y-8 max-w-[1400px] mx-auto pb-8">
                {/* Back Link & Title */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('admin.landlords.index')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        <BackIcon /> Quay lại danh sách
                    </Link>

                    {/* Quick status change buttons */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 mr-2">Trạng thái tài khoản:</span>
                        {landlord.status !== 'active' && (
                            <button
                                onClick={() => handleStatusChange('active')}
                                disabled={statusLoading}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95"
                            >
                                Kích hoạt tài khoản
                            </button>
                        )}
                        {landlord.status !== 'inactive' && (
                            <button
                                onClick={() => handleStatusChange('inactive')}
                                disabled={statusLoading}
                                className="px-3 py-1.5 border border-slate-100 hover:border-red-100 hover:bg-red-50 disabled:opacity-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
                            >
                                Khóa tài khoản
                            </button>
                        )}
                        {landlord.status !== 'pending' && (
                            <button
                                onClick={() => handleStatusChange('pending')}
                                disabled={statusLoading}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all active:scale-95"
                            >
                                Đặt làm chờ duyệt
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Card & Stats Bento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[3px] shadow-lg shadow-emerald-500/25 mb-4">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-teal-800 text-2xl uppercase">
                                {landlord.name.charAt(0)}
                            </div>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{landlord.name}</h3>
                        <p className="text-slate-400 text-xs font-semibold mt-1">Chủ trọ trên hệ thống</p>

                        <div className="mt-3">
                            {landlord.status === 'active' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                    Hoạt động
                                </span>
                            )}
                            {landlord.status === 'inactive' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                                    Bị khóa
                                </span>
                            )}
                            {landlord.status === 'pending' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                    Chờ duyệt
                                </span>
                            )}
                        </div>

                        <div className="w-full border-t border-slate-50 mt-6 pt-5 space-y-3.5 text-left text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Email:</span>
                                <span className="font-bold text-slate-700">{landlord.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Số điện thoại:</span>
                                <span className="font-bold text-slate-700">{landlord.phone || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Ngày gia nhập:</span>
                                <span className="font-bold text-slate-700">{landlord.created_at}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bento (Grid inside grid item) */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* 1. Tòa nhà */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                                <HouseIcon />
                            </div>
                            <div className="mt-8">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Số lượng tòa nhà</span>
                                <span className="block text-3xl font-black text-slate-800 mt-1">{stats.houses_count} Tòa</span>
                            </div>
                        </div>

                        {/* 2. Phòng */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                                <RoomIcon />
                            </div>
                            <div className="mt-8">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Phòng đang quản lý</span>
                                <span className="block text-3xl font-black text-slate-800 mt-1">{stats.rooms_count} Phòng</span>
                            </div>
                        </div>

                        {/* 3. Tổng chi */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <MoneyIcon />
                            </div>
                            <div className="mt-8">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng tiền đã thanh toán</span>
                                <span className="block text-xl font-black text-slate-800 mt-1.5 truncate">{formatVND(stats.total_spent)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Tab Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Houses Owned */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50">
                            <h3 className="text-sm font-extrabold text-slate-800">Danh sách tòa nhà quản lý</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {houses.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-xs font-medium">Chưa có tòa nhà nào được tạo.</div>
                            ) : (
                                houses.map((house) => (
                                    <div key={house.id} className="p-4 hover:bg-slate-50/40 transition-all flex justify-between items-start gap-4">
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm leading-none">{house.name}</h5>
                                            <span className="inline-block mt-2 bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                                {house.type === 'apartment' ? 'Chung cư mini' : 'Nhà trọ thường'}
                                            </span>
                                            <p className="text-slate-400 text-[11px] font-medium mt-2">{house.address}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-slate-700 bg-teal-50 px-2 py-1 rounded-lg">
                                                {house.rooms_count} phòng
                                            </span>
                                            <p className="text-[10px] text-slate-400 font-bold mt-2.5">Tạo ngày: {house.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Subscription History */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50">
                            <h3 className="text-sm font-extrabold text-slate-800">Lịch sử đăng ký gói cước</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/40">
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Gói cước</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Số tiền</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời hạn sử dụng</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {subscriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                                                Chưa có lịch sử giao dịch.
                                            </td>
                                        </tr>
                                    ) : (
                                        subscriptions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/40 transition-all text-xs">
                                                <td className="p-4">
                                                    <span className="font-bold text-teal-700 block">{sub.package_name}</span>
                                                    <span className="text-[10px] text-slate-400 mt-1 block font-medium">Ngày mua: {sub.created_at}</span>
                                                </td>
                                                <td className="p-4 font-black text-slate-800">{formatVND(sub.price_paid)}</td>
                                                <td className="p-4 text-slate-500 font-medium">{sub.start_date} — {sub.end_date}</td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                                                            sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {sub.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                                                        </span>
                                                        <span className={`block text-[9px] font-extrabold uppercase tracking-wider ${
                                                            sub.payment_status === 'paid' ? 'text-emerald-600' : 'text-slate-400'
                                                        }`}>
                                                            {sub.payment_status === 'paid' ? 'Đã thu' : 'Chưa thu'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={confirmStatus.show}
                onClose={() => setConfirmStatus({ show: false, newStatus: null })}
                onConfirm={executeStatusChange}
                title="Đổi trạng thái tài khoản"
                message={`Bạn có chắc chắn muốn chuyển đổi trạng thái tài khoản của chủ trọ sang: ${
                    confirmStatus.newStatus === 'active' ? 'Hoạt động' : confirmStatus.newStatus === 'inactive' ? 'Bị khóa' : 'Chờ duyệt'
                }?`}
                confirmText="Xác nhận"
                type="info"
            />
        </AdminLayout>
    );
}
