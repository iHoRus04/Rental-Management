import { Link, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

// --- UTILS ---
const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Index() {
    const { payments } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');

    const getMethodBadge = (method) => {
        const styles = {
            cash: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tiền mặt', icon: '💵' },
            bank_transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Chuyển khoản', icon: '🏦' },
            check: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Séc', icon: '🎫' },
            other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Khác', icon: '🔹' },
        };
        const style = styles[method] || styles.other;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}>
                <span>{style.icon}</span> {style.label}
            </span>
        );
    };

    // Filter logic
    const filteredPayments = payments.filter(p => 
        p.bill.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bill.renter_request?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Lịch sử thanh toán" />
            
            <div className="max-w-[1600px] mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Tài chính
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Lịch sử thanh toán</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Tìm theo phòng, tên..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <Link
                            href={route('landlord.payments.create')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Ghi nhận thanh toán
                        </Link>
                    </div>
                </div>

                {/* --- PAYMENTS GRID --- */}
                {filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Chưa có dữ liệu thanh toán</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPayments.map((payment) => (
                            <div 
                                key={payment.id} 
                                className="group bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Top Info */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{payment.bill.room.name}</h3>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                T{payment.bill.month}/{payment.bill.year}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {payment.bill.renter_request?.name || 'Không xác định'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-emerald-600">
                                            +{formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 my-4 relative z-10"></div>

                                {/* Bottom Info */}
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex flex-col gap-1">
                                        {getMethodBadge(payment.payment_method)}
                                        <span className="text-[10px] text-gray-400 font-medium ml-1">
                                            {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    <Link
                                        href={route('landlord.payments.show', payment.id)}
                                        className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                    >
                                        Chi tiết
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 z-0 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;