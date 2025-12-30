import { Link, usePage, router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Index() {
    const { bills } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ thanh toán', icon: '⏳' },
            partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán 1 phần', icon: '🌗' },
            paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã thanh toán', icon: '✓' },
            overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Quá hạn', icon: '⚠️' },
        };
        const style = styles[status] || styles.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                <span>{style.icon}</span> {style.label}
            </span>
        );
    };

    const handleGenerateMonthly = () => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        if (confirm(`Bạn có chắc chắn muốn tạo hóa đơn tự động cho tháng ${currentMonth}/${currentYear}?`)) {
            router.post(route('landlord.bills.generateMonthly'), {
                month: currentMonth,
                year: currentYear
            });
        }
    };

    // Filter logic
    const filteredBills = bills.filter(bill => 
        bill.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.renter_request?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Quản lý hóa đơn" />
            
            <div className="max-w-[1600px] mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Tài chính
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Quản lý hóa đơn</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Tìm theo phòng hoặc tên..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <button
                            onClick={handleGenerateMonthly}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-emerald-100 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Tạo tự động
                        </button>

                        <Link
                            href={route('landlord.bills.create')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Tạo hóa đơn
                        </Link>
                    </div>
                </div>

                {/* --- BILLS GRID --- */}
                {filteredBills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Không tìm thấy hóa đơn nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBills.map((bill) => (
                            <div 
                                key={bill.id} 
                                className={`group bg-white rounded-[20px] p-6 shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                                    bill.status === 'overdue' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 hover:border-emerald-200'
                                }`}
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            {bill.room.name}
                                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                T{bill.month}/{bill.year}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {bill.renter_request?.name || 'Chưa có tên'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-extrabold ${bill.status === 'paid' ? 'text-emerald-600' : 'text-teal-900'}`}>
                                            {Math.floor(bill.amount).toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar (Paid Amount) */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-medium mb-1">
                                        <span className="text-gray-500">Đã thanh toán</span>
                                        <span className={bill.paid_amount >= bill.amount ? 'text-emerald-600' : 'text-gray-700'}>
                                            {bill.paid_amount.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                bill.status === 'paid' ? 'bg-emerald-500' : 
                                                bill.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-400'
                                            }`}
                                            style={{ width: `${Math.min((bill.paid_amount / bill.amount) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Footer Info & Actions */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-1">
                                        {getStatusBadge(bill.status)}
                                        <span className="text-[10px] text-gray-400 font-medium">Hạn: {new Date(bill.due_date).toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    <div className="flex gap-2">
                                 
                                        <Link
                                            href={route('landlord.bills.show', bill.id)}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                        >
                                            Chi tiết
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;