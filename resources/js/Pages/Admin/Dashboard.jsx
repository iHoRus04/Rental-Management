import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

// --- Icons ---
const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const BuildingIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const CashIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ChatIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
);

// --- SVG Donut Chart Component ---
const DonutChart = ({ data, size = 140, strokeWidth = 18 }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-xs text-slate-400 font-medium">Chưa có dữ liệu</span>
            </div>
        );
    }

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
            {/* Background circle */}
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
            {/* Data segments */}
            {data.filter(d => d.value > 0).map((segment, idx) => {
                const segmentLength = (segment.value / total) * circumference;
                const gapSize = data.filter(d => d.value > 0).length > 1 ? 4 : 0;
                const dashArray = `${Math.max(0, segmentLength - gapSize)} ${circumference - Math.max(0, segmentLength - gapSize)}`;
                const offset = cumulativeOffset;
                cumulativeOffset += segmentLength;

                return (
                    <circle
                        key={idx}
                        cx={size/2}
                        cy={size/2}
                        r={radius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ opacity: 0.9 }}
                    />
                );
            })}
            {/* Center text */}
            <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" className="fill-slate-800 font-black transform rotate-90" style={{ fontSize: '1.25rem', transformOrigin: `${size/2}px ${size/2}px` }}>
                {total}
            </text>
        </svg>
    );
};

const formatVND = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

export default function Dashboard({ stats, revenueChart, landlordStatusChart, topPackages, recentLandlords, recentSubscriptions }) {
    const [monthsLimit, setMonthsLimit] = useState(6);

    const filteredRevenueChart = useMemo(() => {
        return (revenueChart || []).slice(-monthsLimit);
    }, [revenueChart, monthsLimit]);

    const maxRevenue = useMemo(() => {
        return Math.max(...filteredRevenueChart.map(d => d.revenue), 1);
    }, [filteredRevenueChart]);

    return (
        <AdminLayout title="Tổng quan hệ thống">
            <Head title="Admin Dashboard" />

            <div className="space-y-8 max-w-[1400px] mx-auto pb-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Doanh thu tháng */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute top-[-40%] right-[-20%] w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl"><CashIcon /></div>
                                {stats.revenueChangePercent !== 0 && (
                                    <span className={`text-[11px] font-extrabold px-2 py-1 rounded-lg ${stats.revenueChangePercent >= 0 ? 'bg-white/20' : 'bg-red-400/30'}`}>
                                        {stats.revenueChangePercent >= 0 ? '↗' : '↘'} {Math.abs(stats.revenueChangePercent)}%
                                    </span>
                                )}
                            </div>
                            <span className="text-emerald-100 text-[11px] font-bold uppercase tracking-wider">Doanh thu tháng này</span>
                            <h3 className="text-2xl font-black mt-1 tracking-tight">{formatVND(stats.monthlyRevenue)}</h3>
                        </div>
                    </div>

                    {/* Tổng doanh thu */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><CashIcon /></div>
                        </div>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tổng doanh thu</span>
                        <h3 className="text-xl font-black text-slate-800 mt-1 truncate">{formatVND(stats.totalRevenue)}</h3>
                    </div>

                    {/* Tổng chủ trọ */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><UsersIcon /></div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{stats.activeLandlords} hoạt động</span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tổng chủ trọ</span>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.totalLandlords}</h3>
                    </div>

                    {/* Tổng phòng + Feedbacks */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600"><BuildingIcon /></div>
                            {stats.pendingFeedbacksCount > 0 && (
                                <Link href={route('admin.feedbacks.index')} className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg hover:bg-rose-100 transition-all">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                    {stats.pendingFeedbacksCount} góp ý
                                </Link>
                            )}
                        </div>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Phòng trên hệ thống</span>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.totalRooms}</h3>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart - Doanh thu hệ thống */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">Doanh thu hệ thống</h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">Tổng thu từ bán gói dịch vụ phần mềm</p>
                            </div>
                            
                            {/* Months selector pills */}
                            <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0">
                                {[3, 6, 12].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMonthsLimit(m)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                                            monthsLimit === m
                                                ? 'bg-white text-emerald-700 shadow-sm border-0'
                                                : 'text-slate-500 hover:text-slate-800 border-0 bg-transparent'
                                        }`}
                                    >
                                        {m} Tháng
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-2 scrollbar-thin">
                            <div className="relative flex items-end justify-between gap-3 sm:gap-5 h-56 px-1 min-w-[280px]">
                                {(filteredRevenueChart || []).map((data, idx) => {
                                    const h = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full relative cursor-pointer min-w-[28px]">
                                            {/* Tooltip */}
                                            <div className="absolute -top-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap z-20 shadow-lg transform group-hover:-translate-y-1 pointer-events-none">
                                                {formatVND(data.revenue)}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>
                                            {/* Bar */}
                                            <div
                                                className="w-full max-w-[52px] rounded-2xl relative overflow-hidden transition-all duration-500 group-hover:scale-[1.04] group-hover:shadow-lg border border-slate-100/50"
                                                style={{ height: `${Math.max(h, 4)}%` }}
                                            >
                                                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-emerald-500 via-teal-400 to-teal-300 rounded-2xl opacity-85 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            {/* Label */}
                                            <span className="text-[10px] text-slate-400 font-bold mt-3 group-hover:text-emerald-600 transition-colors whitespace-nowrap">{data.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Donut Charts */}
                    <div className="space-y-6">
                        {/* Trạng thái Chủ trọ */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-extrabold text-slate-800 mb-5">Phân bổ trạng thái chủ trọ</h3>
                            <div className="flex items-center gap-6">
                                <DonutChart data={landlordStatusChart || []} size={120} strokeWidth={16} />
                                <div className="space-y-2.5 flex-1">
                                    {(landlordStatusChart || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-slate-600 font-medium">{item.label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top gói cước */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-extrabold text-slate-800 mb-5">Top gói cước phổ biến</h3>
                            <div className="flex items-center gap-6">
                                <DonutChart data={topPackages || []} size={120} strokeWidth={16} />
                                <div className="space-y-2.5 flex-1">
                                    {(topPackages || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-slate-600 font-medium truncate">{item.label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 pl-2">{item.value} lượt</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chủ trọ đăng ký gần đây */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-800">Chủ trọ đăng ký gần đây</h3>
                        <Link href={route('admin.landlords.index')} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Xem tất cả →</Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {(recentLandlords || []).length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-medium">Chưa có dữ liệu.</div>
                        ) : (
                            recentLandlords.map((landlord) => (
                                <div key={landlord.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                                            {landlord.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h5 className="font-bold text-slate-800 text-sm truncate leading-none">{landlord.name}</h5>
                                            <p className="text-slate-400 text-[11px] font-medium mt-1 truncate">{landlord.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 pl-3">
                                        <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">{landlord.created_at}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                                            landlord.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : landlord.status === 'expired'
                                                ? 'bg-rose-50 text-rose-600'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {landlord.status === 'active' ? 'Hoạt động' : landlord.status === 'expired' ? 'Hết hạn' : 'Chờ duyệt'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bảng giao dịch chi tiết (thay thế trang Revenue) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-800">Lịch sử giao dịch mua gói cước</h3>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">10 giao dịch đăng ký gói dịch vụ gần nhất trên toàn hệ thống</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">{stats.activeSubsCount} gói hoạt động</span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">+{stats.newSubsCount} mới tháng này</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40">
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Chủ trọ</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Gói cước</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Doanh thu</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời hạn sử dụng</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày mua</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(recentSubscriptions || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-slate-400 text-xs font-medium">
                                            Chưa có giao dịch nào được ghi nhận.
                                        </td>
                                    </tr>
                                ) : (
                                    recentSubscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/40 transition-all text-xs">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{sub.landlord_name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{sub.landlord_email}</div>
                                            </td>
                                            <td className="p-4 font-bold text-teal-700">{sub.package_name}</td>
                                            <td className="p-4 font-black text-slate-800">{formatVND(sub.price_paid)}</td>
                                            <td className="p-4 text-slate-500 font-medium">{sub.start_date} — {sub.end_date}</td>
                                            <td className="p-4">
                                                <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                                                    sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {sub.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 font-medium">{sub.created_at}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
