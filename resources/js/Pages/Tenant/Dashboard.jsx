import React, { useState } from 'react';
import TenantLayout from '@/Layouts/TenantLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantDashboard({ auth, contract, room, landlord, recentRequests = [], requestsStats }) {
    const user = auth.user;
    const [copiedPhone, setCopiedPhone] = useState(false);

    const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0);

    const handleCopyPhone = (phone) => {
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Chờ xử lý', bg: 'bg-amber-50 border-amber-100 text-amber-700', icon: '⏳' },
            in_progress: { label: 'Đang xử lý', bg: 'bg-blue-50 border-blue-100 text-blue-700', icon: '🛠️' },
            resolved: { label: 'Đã giải quyết', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: '✓' },
            closed: { label: 'Đã đóng', bg: 'bg-gray-50 border-gray-100 text-gray-500', icon: '🔒' },
        };
        return configs[status] || configs.pending;
    };

    const currentDateString = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <TenantLayout user={user}>
            <Head title="Bảng điều khiển khách thuê" />

            <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans space-y-8">

                {/* ── BANNER CHÀO MỪNG CHUYÊN NGHIỆP ── */}
                <div className="relative bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-700 rounded-[32px] p-8 sm:p-10 shadow-xl overflow-hidden border border-emerald-700/30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Cổng thông tin cư dân
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Xin chào, {user.name}! 👋
                            </h1>
                            <p className="text-emerald-100/80 text-sm max-w-xl font-medium">
                                Chào mừng bạn quay trở lại. Hôm nay là {currentDateString}. Hãy xem nhanh các thông tin phòng trọ và hóa đơn của bạn bên dưới.
                            </p>
                        </div>

                        {contract && (
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 text-white min-w-[220px]">
                                <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Mã phòng của bạn</p>
                                <p className="text-2xl font-black tracking-tight mt-0.5">{room?.name || 'Chưa cập nhật'}</p>
                                <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                                    <span className="text-white/70">Tiền phòng:</span>
                                    <span className="font-bold text-emerald-300">{fmt(contract.monthly_rent)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CHI TIẾT PHÒNG THUÊ & HỢP ĐỒNG ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Your Home card */}
                    <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none"></div>

                        <div>
                            <div className="flex items-center justify-between pb-6 border-b border-slate-50 mb-6">
                                <h2 className="text-xl font-extrabold text-teal-950 flex items-center gap-2">
                                    <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">🏠</span>
                                    Thông tin thuê phòng
                                </h2>
                                {contract && (
                                    <span className="px-3 py-1 bg-emerald-100/65 text-emerald-800 rounded-full text-xs font-bold">
                                        Hợp đồng hoạt động
                                    </span>
                                )}
                            </div>

                            {contract && room && landlord ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tòa nhà / Nhà trọ</p>
                                        <p className="text-base font-extrabold text-slate-800">{room.house.name}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{room.house.address || 'Chưa cập nhật địa chỉ'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chi tiết phòng</p>
                                        <p className="text-base font-extrabold text-slate-800">Phòng {room.name}</p>
                                        <p className="text-xs text-slate-500">Tầng: {room.floor || 1} • Trạng thái: Đang ở</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chủ nhà trọ</p>
                                        <p className="text-base font-extrabold text-slate-800">{landlord.name}</p>
                                        <div className="text-xs text-slate-500 space-y-1 mt-1">
                                            {landlord.phone ? (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-semibold text-slate-700">📞 {landlord.phone}</span>
                                                    <button
                                                        onClick={() => handleCopyPhone(landlord.phone)}
                                                        className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold rounded transition-colors"
                                                    >
                                                        {copiedPhone ? '✓ Đã chép' : 'Chép'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 italic">📞 Chưa cập nhật SĐT</p>
                                            )}
                                            {landlord.email && (
                                                <p className="flex items-center gap-1 font-medium text-slate-600 truncate">
                                                    ✉️ <a href={`mailto:${landlord.email}`} className="hover:text-emerald-600 underline">{landlord.email}</a>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chu kỳ thuê hợp đồng</p>
                                        <p className="text-base font-extrabold text-slate-800">
                                            {new Date(contract.start_date).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Đến ngày: {contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center flex flex-col items-center justify-center">
                                    <span className="text-3xl mb-3">📭</span>
                                    <p className="text-slate-500 font-medium">Bạn chưa liên kết với bất kỳ phòng trọ nào.</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Liên hệ chủ nhà của bạn để được thêm vào danh sách thuê phòng.</p>
                                </div>
                            )}
                        </div>

                        {contract && (
                            <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                                <span>Ký kết ngày: {new Date(contract.created_at || contract.start_date).toLocaleDateString('vi-VN')}</span>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={route('tenant.contracts.pdf', contract.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold rounded-lg transition-colors border border-emerald-200/60 shadow-sm active:scale-95"
                                    >
                                        📄 Tải PDF Hợp đồng
                                    </a>
                                    <span className="font-semibold text-teal-800">Mã HĐ: #CON-{contract.id}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Quick Utilities Card */}
                    <div className="bg-gradient-to-br from-teal-900 to-emerald-800 rounded-[24px] p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>

                        <div>
                            <h3 className="text-lg font-extrabold text-emerald-300 mb-2 tracking-wide uppercase text-[10px]">Tiện ích nhanh</h3>
                            <h2 className="text-2xl font-black leading-tight mb-4">Các lối tắt tiện lợi cho bạn</h2>
                            <p className="text-emerald-100/70 text-xs mb-6">Bạn có thể tạo nhanh yêu cầu sửa chữa cơ sở vật chất hoặc xem toàn bộ danh sách hóa đơn thanh toán tại đây.</p>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href={route('tenant.requests.create')}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-teal-900 hover:bg-emerald-50 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] shadow-md shadow-emerald-950/20"
                            >
                                🛠️ Báo cáo sự cố phòng trọ
                            </Link>

                            <Link
                                href={route('tenant.bills.index')}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-800/60 hover:bg-teal-800/80 text-white rounded-xl font-bold text-xs border border-white/10 transition-all hover:scale-[1.02]"
                            >
                                🧾 Xem lịch sử hóa đơn
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── THỐNG KÊ YÊU CẦU / BÁO CÁO ── */}
                <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-teal-950">Tiến độ xử lý sự cố</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl border border-amber-100 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-xl text-amber-500">⏳</div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-800">{requestsStats.pending}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Đang chờ tiếp nhận</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-blue-100 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl text-blue-500">🛠️</div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-800">{requestsStats.in_progress}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Đang được sửa chữa</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-emerald-100 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-xl text-emerald-500">✓</div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-800">{requestsStats.resolved}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Sự cố đã khắc phục</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── YÊU CẦU MỚI GỬI / TIẾN ĐỘ CHI TIẾT ── */}
                <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm">
                    <div className="flex justify-between items-center pb-6 border-b border-slate-50 mb-6">
                        <h3 className="text-lg font-extrabold text-teal-950 flex items-center gap-2">
                            <span>📋</span> Báo cáo sự cố gần đây
                        </h3>
                        {recentRequests.length > 0 && (
                            <Link
                                href={route('tenant.requests.index')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Xem tất cả yêu cầu →
                            </Link>
                        )}
                    </div>

                    {recentRequests.length > 0 ? (
                        <div className="space-y-4">
                            {recentRequests.map((request) => {
                                const cfg = getStatusConfig(request.status);
                                return (
                                    <Link
                                        key={request.id}
                                        href={route('tenant.requests.show', request.id)}
                                        className="block p-5 border border-gray-50 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/5 transition-all duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                                                        Phòng {room?.name}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Gửi ngày: {new Date(request.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-extrabold text-teal-950 truncate">{request.title}</h4>
                                                <p className="text-xs text-slate-400 line-clamp-1 font-medium">{request.description}</p>
                                            </div>

                                            <div className="flex items-center gap-3 self-start sm:self-auto">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold ${cfg.bg}`}>
                                                    <span>{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-14 text-center flex flex-col items-center justify-center bg-gray-50/30 rounded-2xl border border-dashed border-slate-200">
                            <span className="text-3xl mb-2">🍃</span>
                            <p className="text-slate-500 font-bold text-sm">Chưa ghi nhận sự cố hay báo cáo nào</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Mọi báo cáo về hư hỏng bóng đèn, điện nước, thiết bị sẽ xuất hiện tại đây.</p>
                            <Link
                                href={route('tenant.requests.create')}
                                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/10 transition-all active:scale-95"
                            >
                                Báo cáo sự cố ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </TenantLayout>
    );
}
