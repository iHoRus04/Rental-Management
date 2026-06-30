import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Inline Icons
const TotalCash = () => (
    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const CalMonth = () => (
    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

const CycleArrow = () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5M7 17a5 5 0 018.905-2.905M17 17a5 5 0 01-8.905 2.905" /></svg>
);

const NewFlag = () => (
    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
);

export default function Index({ stats, transactions }) {
    // Format currency VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Tìm giá trị lớn nhất trong chart_data để tính chiều cao cột tương đối
    const maxRevenue = Math.max(...stats.chart_data.map(d => d.revenue), 1000000);

    return (
        <AdminLayout title="Báo cáo Doanh thu bán phần mềm">
            <Head title="Báo cáo doanh thu phần mềm" />

            <div className="space-y-8">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Tổng doanh thu */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                            <TotalCash />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng doanh thu bán phần mềm</span>
                            <span className="block text-lg font-black text-slate-800 mt-1">{formatVND(stats.total_revenue)}</span>
                        </div>
                    </div>

                    {/* Doanh thu tháng này */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <CalMonth />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Doanh thu tháng này</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="block text-lg font-black text-slate-800">{formatVND(stats.monthly_revenue)}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    stats.growth_percent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    {stats.growth_percent >= 0 ? '+' : ''}{stats.growth_percent}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Số gói hoạt động */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <CycleArrow />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Gói đang hoạt động</span>
                            <span className="block text-lg font-black text-slate-800 mt-1">{stats.active_subs} gói cước</span>
                        </div>
                    </div>

                    {/* Đăng ký mới */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                            <NewFlag />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Lượt mua mới tháng này</span>
                            <span className="block text-lg font-black text-slate-800 mt-1">+{stats.new_subs} giao dịch</span>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Biểu đồ cột: Doanh thu 6 tháng qua */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6">Thống kê doanh thu 6 tháng qua</h3>
                        
                        <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-slate-100 pb-1">
                            {stats.chart_data.map((data, index) => {
                                const heightPercent = Math.max(8, Math.round((data.revenue / maxRevenue) * 100));
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                            {formatVND(data.revenue)}
                                        </div>
                                        {/* Bar */}
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl group-hover:from-emerald-600 group-hover:to-teal-500 transition-all shadow-md shadow-emerald-500/10"
                                        ></div>
                                        {/* Label */}
                                        <span className="text-[10px] text-slate-400 font-bold mt-2 whitespace-nowrap">
                                            {data.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phân khúc doanh thu theo gói cước */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6">Phân khúc Doanh thu theo gói</h3>
                        
                        <div className="space-y-5">
                            {stats.segments.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-8">Chưa ghi nhận doanh thu.</p>
                            ) : (
                                stats.segments.map((seg, idx) => {
                                    const percent = stats.total_revenue > 0 ? Math.round((seg.value / stats.total_revenue) * 100) : 0;
                                    const colors = ['bg-teal-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500'];
                                    const progressColor = colors[idx % colors.length];

                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>{seg.name}</span>
                                                <span className="text-slate-500">{formatVND(seg.value)} ({percent}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${percent}%` }}
                                                    className={`h-full ${progressColor} rounded-full`}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Transaction Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">Các giao dịch đăng ký gói gần đây</h3>
                        <p className="text-xs text-slate-400 mt-1">Danh sách 10 lịch sử giao dịch mua bản quyền phần mềm mới nhất</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Chủ trọ</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gói cước</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doanh thu</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thời hạn sử dụng</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái gói</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thanh toán</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian mua</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400 text-sm font-medium">
                                            Không có giao dịch nào được ghi nhận.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trans) => (
                                        <tr key={trans.id} className="hover:bg-slate-50/50 transition-all text-xs">
                                            <td className="p-4 font-bold text-slate-800">
                                                <div>{trans.user_name}</div>
                                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{trans.user_email}</div>
                                            </td>
                                            <td className="p-4 font-bold text-teal-700">{trans.package_name}</td>
                                            <td className="p-4 font-black text-slate-800">{formatVND(trans.price_paid)}</td>
                                            <td className="p-4 text-slate-600 font-medium">
                                                {trans.start_date.split(' ')[0]} - {trans.end_date}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    trans.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {trans.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-emerald-600 font-bold">Thành công</span>
                                            </td>
                                            <td className="p-4 text-slate-400 font-medium">{trans.start_date}</td>
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
