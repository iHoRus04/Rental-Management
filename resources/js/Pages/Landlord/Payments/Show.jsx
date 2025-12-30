import { Link, usePage, useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- UTILS ---
const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Show() {
    const { payment } = usePage().props;
    const { delete: destroy } = useForm();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        destroy(route('landlord.payments.destroy', payment.id), {
            onSuccess: () => {
                window.location.href = route('landlord.payments.index');
            }
        });
    };

    const getMethodConfig = (method) => {
        const configs = {
            'cash': { label: 'Tiền mặt', icon: '💵', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            'bank_transfer': { label: 'Chuyển khoản', icon: '🏦', color: 'text-blue-600', bg: 'bg-blue-50' },
            'check': { label: 'Séc', icon: '🎫', color: 'text-purple-600', bg: 'bg-purple-50' },
            'other': { label: 'Khác', icon: '🔹', color: 'text-gray-600', bg: 'bg-gray-50' }
        };
        return configs[method] || configs['other'];
    };

    const getStatusConfig = (status) => {
        const configs = {
            'pending': { label: 'Chờ thanh toán', color: 'text-yellow-700', bg: 'bg-yellow-100' },
            'partial': { label: 'Thanh toán 1 phần', color: 'text-blue-700', bg: 'bg-blue-100' },
            'paid': { label: 'Đã thanh toán', color: 'text-emerald-700', bg: 'bg-emerald-100' },
            'overdue': { label: 'Quá hạn', color: 'text-rose-700', bg: 'bg-rose-100' }
        };
        return configs[status] || configs['pending'];
    };

    const methodInfo = getMethodConfig(payment.payment_method);
    const billStatus = getStatusConfig(payment.bill.status);

    return (
        <div className="min-h-screen bg-emerald-50/40 py-8 px-4 sm:px-6 lg:px-8 font-sans relative">
            <Head title={`Thanh toán #${payment.id}`} />
            
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100/50 to-transparent -z-10"></div>

            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={route('landlord.payments.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại lịch sử
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- LEFT COLUMN: THE RECEIPT (PHIẾU THU) --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 overflow-hidden border border-gray-100 relative">
                            {/* Header Stripe */}
                            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                            
                            <div className="p-8">
                                {/* Receipt Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Thanh toán thành công</h1>
                                    <p className="text-gray-500 text-sm">Mã giao dịch: <span className="font-mono font-bold text-gray-700">#{payment.id}</span></p>
                                </div>

                                {/* Main Amount */}
                                <div className="flex flex-col items-center justify-center py-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 border-dashed mb-8">
                                    <p className="text-sm font-medium text-emerald-600 mb-1 uppercase tracking-wider">Số tiền đã trả</p>
                                    <p className="text-5xl font-extrabold text-emerald-700 tracking-tight">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                </div>

                                {/* Details Grid - Đã làm đầy đặn hơn */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ngày ghi nhận</p>
                                        <p className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phương thức</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${methodInfo.bg} ${methodInfo.color}`}>
                                                {methodInfo.icon}
                                            </span>
                                            <span className="text-gray-900 font-semibold text-lg">{methodInfo.label}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Người thực hiện</p>
                                        <p className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {payment.bill.contract?.renterRequest?.name?.charAt(0) || 'U'}
                                            </span>
                                            {payment.bill.contract?.renterRequest?.name || 'Không xác định'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mã tham chiếu / Ref</p>
                                        <p className="text-gray-900 font-mono font-medium text-lg">
                                            {payment.reference ? payment.reference : <span className="text-gray-300 italic">Không có</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="my-8 border-t border-gray-100 relative">
                                    <div className="absolute left-0 -top-3 w-6 h-6 bg-gray-50 rounded-full -ml-11"></div> {/* "Ticket" cutout effect */}
                                    <div className="absolute right-0 -top-3 w-6 h-6 bg-gray-50 rounded-full -mr-11"></div>
                                </div>

                                {/* Notes Section - Lấp đầy phần dưới */}
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Ghi chú
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed italic">
                                        {payment.notes || "Không có ghi chú thêm cho giao dịch này."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: CONTEXT & ACTIONS --- */}
                    <div className="space-y-6">
                        
                        {/* 1. Context Card (Bill Info) */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col h-fit">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                                Hóa đơn liên quan
                            </h2>

                            <div className="flex-grow bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-blue-500 font-bold uppercase">Phòng</p>
                                        <p className="text-xl font-bold text-blue-900">{payment.bill.room.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-blue-500 font-bold uppercase">Kỳ hạn</p>
                                        <p className="font-bold text-blue-900">T{payment.bill.month}/{payment.bill.year}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-blue-200/50">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700/70">Tổng hóa đơn:</span>
                                        <span className="font-bold text-blue-900">{formatCurrency(payment.bill.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700/70">Đã thanh toán:</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(payment.bill.paid_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${billStatus.bg} ${billStatus.color}`}>
                                    {billStatus.label}
                                </span>
                            </div>

                            <Link
                                href={route('landlord.bills.show', payment.bill.id)}
                                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all text-center flex items-center justify-center gap-2"
                            >
                                Xem chi tiết hóa đơn
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                        </div>

                        {/* 2. Actions Card (Separated for emphasis) */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác</h2>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href={route('landlord.payments.edit', payment.id)}
                                    className="w-full py-3 bg-teal-50 text-teal-700 rounded-xl font-bold text-sm hover:bg-teal-100 transition-all text-center flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Chỉnh sửa thông tin
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hủy thanh toán này
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-[24px] shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 border border-gray-100">
                            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 mx-auto">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 text-center mb-2">Xác nhận xóa?</h3>
                            <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed px-2">
                                Bạn có chắc chắn muốn hủy giao dịch này? Số tiền đã trả của hóa đơn sẽ bị trừ đi <span className="font-bold text-rose-600">{formatCurrency(payment.amount)}</span>.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Giữ lại
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 text-sm"
                                >
                                    Đồng ý Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;