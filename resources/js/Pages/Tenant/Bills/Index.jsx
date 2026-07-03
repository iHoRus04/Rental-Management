import { Head, Link } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

export default function Index({ auth, bills }) {
    const getStatusConfig = (status) => {
        const configs = {
            paid: { label: 'Đã thanh toán', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            pending: { label: 'Chưa thanh toán', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
            partial: { label: 'Thanh toán một phần', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
            overdue: { label: 'Quá hạn', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
        };
        return configs[status] || configs.pending;
    };

    const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v ?? 0);

    const totalUnpaid = bills
        .filter(b => b.status !== 'paid')
        .reduce((sum, b) => sum + (b.amount - b.paid_amount), 0);

    return (
        <TenantLayout user={auth.user}>
            <Head title="Hóa đơn của tôi" />
            <div className="p-6 md:p-10 max-w-[1200px] mx-auto font-sans">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">
                        Hóa đơn của tôi
                    </h1>
                    <p className="text-emerald-600/80 font-medium text-sm mt-1">
                        Xem và đối chiếu các hóa đơn hàng tháng
                    </p>
                </div>

                {/* Summary Card */}
                {totalUnpaid > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm font-medium">Tổng nợ chưa thanh toán</p>
                                <p className="text-3xl font-extrabold mt-1">{fmt(totalUnpaid)}₫</p>
                            </div>
                            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Bills List */}
                {bills.length > 0 ? (
                    <div className="space-y-4">
                        {bills.map((bill) => {
                            const statusCfg = getStatusConfig(bill.status);
                            const remaining = bill.amount - bill.paid_amount;
                            return (
                                <Link
                                    key={bill.id}
                                    href={route('tenant.bills.show', bill.id)}
                                    className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Month Badge */}
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col items-center justify-center">
                                                <span className="text-xs text-emerald-600 font-semibold">Tháng</span>
                                                <span className="text-2xl font-extrabold text-teal-800">{bill.month}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    Hóa đơn tháng {bill.month}/{bill.year}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {bill.room?.name}
                                                    {bill.due_date && (
                                                        <span className="ml-2">
                                                            • Hạn: {new Date(bill.due_date).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xl font-extrabold text-gray-800">{fmt(bill.amount)}₫</p>
                                                {remaining > 0 && bill.status !== 'paid' && (
                                                    <p className="text-sm text-red-500 font-medium">Còn nợ: {fmt(remaining)}₫</p>
                                                )}
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                                                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                                                {statusCfg.label}
                                            </span>
                                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Chưa có hóa đơn nào</p>
                        <p className="text-gray-400 text-sm mt-2">Hóa đơn sẽ xuất hiện khi chủ trọ tạo</p>
                    </div>
                )}
            </div>
        </TenantLayout>
    );
}
