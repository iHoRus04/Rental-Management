import { Link, usePage, Head } from '@inertiajs/react';
import { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- UTILS ---
// Hàm format tiền tệ chuẩn theo yêu cầu của bạn
const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Show() {
    const { bill, csrf_token } = usePage().props;
    const formRef = useRef();

    // Badge trạng thái hóa đơn
    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ thanh toán', icon: '⏳', dot: 'bg-yellow-500' },
            partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán 1 phần', icon: '🌗', dot: 'bg-blue-500' },
            paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã thanh toán', icon: '✓', dot: 'bg-emerald-500' },
            overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Quá hạn', icon: '⚠️', dot: 'bg-rose-500' },
        };
        const style = config[status] || config.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
                {style.label}
            </span>
        );
    };

    // Tính số tiền còn lại
    const remaining = bill.amount - bill.paid_amount;

    // Xử lý xuất PDF
    const handleExportPDF = () => {
        formRef.current.submit();
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Hóa đơn #${bill.id}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.bills.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách hóa đơn
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                            <div>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight mb-2">
                                    Hóa đơn tháng {bill.month}/{bill.year}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <span className="font-bold text-gray-900">{bill.room.name}</span>
                                    <span>•</span>
                                    <span>{bill.renter_request?.name || 'Không xác định'}</span>
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(bill.status)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Bill Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* 1. Chi tiết dịch vụ */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></span>
                                Chi tiết dịch vụ
                            </h2>

                            <div className="space-y-4">
                                {/* Tiền phòng */}
                                <div className="flex justify-between items-center p-3 border-b border-gray-100 pb-3">
                                    <span className="text-gray-600 font-medium">Tiền phòng</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(bill.room_price)}</span>
                                </div>

                                {/* Tiền điện */}
                                {bill.electric_cost > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                        <div>
                                            <span className="text-yellow-800 font-bold block text-sm">Tiền Điện</span>
                                            <span className="text-xs text-yellow-600">
                                                {bill.electric_kwh} kWh × {formatCurrency(bill.electric_price)}/kWh
                                            </span>
                                        </div>
                                        <span className="font-bold text-yellow-900">{formatCurrency(bill.electric_cost)}</span>
                                    </div>
                                )}

                                {/* Tiền nước */}
                                {bill.water_cost > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <div>
                                            <span className="text-blue-800 font-bold block text-sm">Tiền Nước</span>
                                            <span className="text-xs text-blue-600">
                                                {bill.water_usage} m³ × {formatCurrency(bill.water_price)}/m³
                                            </span>
                                        </div>
                                        <span className="font-bold text-blue-900">{formatCurrency(bill.water_cost)}</span>
                                    </div>
                                )}

                                {/* Internet */}
                                {bill.internet_cost > 0 && (
                                    <div className="flex justify-between items-center p-3 border-b border-gray-100 pb-3">
                                        <span className="text-gray-600 font-medium">Internet</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(bill.internet_cost)}</span>
                                    </div>
                                )}

                                {/* Rác */}
                                {bill.trash_cost > 0 && (
                                    <div className="flex justify-between items-center p-3 border-b border-gray-100 pb-3">
                                        <span className="text-gray-600 font-medium">Rác & Vệ sinh</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(bill.trash_cost)}</span>
                                    </div>
                                )}

                                {/* Khác */}
                                {bill.other_costs > 0 && (
                                    <div className="flex justify-between items-center p-3 border-b border-gray-100 pb-3">
                                        <span className="text-gray-600 font-medium">Chi phí khác</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(bill.other_costs)}</span>
                                    </div>
                                )}

                                {/* Tổng cộng */}
                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-gray-300">
                                    <span className="text-lg font-bold text-teal-900">Tổng cộng</span>
                                    <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(bill.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Ghi chú */}
                        {bill.notes && (
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Ghi chú</h3>
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    {bill.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Payment Status */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span>
                                Thanh toán
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Đã thanh toán</p>
                                    <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(bill.paid_amount)}</p>
                                </div>

                                <div className={`p-4 rounded-xl border text-center ${remaining > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>Còn lại</p>
                                    <p className={`text-xl font-extrabold ${remaining > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                        {formatCurrency(remaining)}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Hạn thanh toán</span>
                                        <span className="font-medium text-gray-900">{new Date(bill.due_date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {bill.paid_date && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Ngày thanh toán</span>
                                            <span className="font-medium text-gray-900">{new Date(bill.paid_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link
                                href={route('landlord.bills.edit', bill.id)}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Chỉnh sửa hóa đơn
                            </Link>

                            <form ref={formRef} action={route('landlord.bills.exportPDF', bill.id)} method="POST" className="hidden">
                                <input type="hidden" name="_token" value={csrf_token} />
                            </form>
                            
                            <button
                                onClick={handleExportPDF}
                                className="w-full py-3 bg-white border-2 border-emerald-100 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Xuất PDF
                            </button>

                            <Link
                                as="button"
                                method="delete"
                                href={route('landlord.bills.destroy', bill.id)}
                                onClick={(e) => {
                                    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Xóa hóa đơn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Layout to prevent Sidebar reload
Show.layout = (page) => <AuthenticatedLayout children={page} />;