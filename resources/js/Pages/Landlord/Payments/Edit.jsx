import { Link, usePage, useForm, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- UTILS ---
const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Edit() {
    const { payment, bills } = usePage().props;
    const { data, setData, put, errors, processing } = useForm({
        bill_id: payment.bill_id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        reference: payment.reference || '',
        notes: payment.notes || ''
    });

    const [selectedBill, setSelectedBill] = useState(payment.bill || null);
    // Tính toán lại số tiền còn lại dựa trên hóa đơn hiện tại + số tiền của payment đang sửa
    const [remainingAmount, setRemainingAmount] = useState(0);

    useEffect(() => {
        if (selectedBill) {
            // Logic: Số tiền còn lại = (Tổng tiền - Đã trả) + Số tiền của payment này (vì đang sửa nó)
            // Lưu ý: Logic này chỉ đúng nếu payment.bill_id không thay đổi. Nếu đổi bill khác thì phải tính lại từ đầu.
            let currentRemaining = selectedBill.amount - selectedBill.paid_amount;
            
            // Nếu bill được chọn là bill cũ của payment này, cộng lại số tiền đã trả để hiển thị đúng hạn mức
            if (selectedBill.id === payment.bill_id) {
                currentRemaining += parseFloat(payment.amount);
            }
            
            setRemainingAmount(currentRemaining);
        }
    }, [selectedBill, payment]);

    const handleBillChange = (e) => {
        const billId = e.target.value;
        setData('bill_id', billId);
        
        const bill = bills.find(b => b.id == billId);
        if (bill) {
            setSelectedBill(bill);
        } else {
            setSelectedBill(null);
            setRemainingAmount(0);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.payments.update', payment.id));
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ thanh toán', dot: 'bg-yellow-500' },
            partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán 1 phần', dot: 'bg-blue-500' },
            paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã thanh toán', dot: 'bg-emerald-500' },
            overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Quá hạn', dot: 'bg-rose-500' },
        };
        const style = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                {style.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa thanh toán #${payment.id}`} />
            
            <div className="max-w-5xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.payments.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Chỉnh sửa thanh toán
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Cập nhật thông tin cho giao dịch <span className="font-mono font-bold text-gray-700">#{payment.id}</span>
                            </p>
                        </div>
                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                
                                {/* Section 1: Chọn Hóa đơn & Số tiền */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                        Thông tin cơ bản
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Chọn hóa đơn <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    value={data.bill_id}
                                                    onChange={handleBillChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                                >
                                                    {bills.map((bill) => (
                                                        <option key={bill.id} value={bill.id}>
                                                            Phòng {bill.room.name} - T{bill.month}/{bill.year} ({bill.contract?.renterRequest?.name})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                            {errors.bill_id && <p className="text-red-500 text-sm mt-1">{errors.bill_id}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Số tiền thanh toán <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={data.amount}
                                                        onChange={(e) => setData('amount', e.target.value)}
                                                        max={remainingAmount}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12 font-bold text-gray-900 text-lg"
                                                        required
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">đ</div>
                                                </div>
                                                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                                {selectedBill && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Tối đa có thể sửa: <span className="font-bold text-emerald-600">{formatCurrency(remainingAmount)}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày thanh toán <span className="text-red-500">*</span></label>
                                                <input
                                                    type="date"
                                                    value={data.payment_date}
                                                    onChange={(e) => setData('payment_date', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                                    required
                                                />
                                                {errors.payment_date && <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Chi tiết khác */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                        Chi tiết khác
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phương thức <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    value={data.payment_method}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                                >
                                                    <option value="cash">💵 Tiền mặt</option>
                                                    <option value="bank_transfer">🏦 Chuyển khoản</option>
                                                    <option value="check">🎫 Séc</option>
                                                    <option value="other">🔹 Khác</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                            {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Mã tham chiếu</label>
                                            <input
                                                type="text"
                                                value={data.reference}
                                                onChange={(e) => setData('reference', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                                placeholder="VD: Mã giao dịch..."
                                            />
                                            {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                            placeholder="Nhập ghi chú..."
                                        />
                                        {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                                    <Link
                                        href={route('landlord.payments.show', payment.id)}
                                        className="px-6 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Hủy bỏ
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {processing && (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        )}
                                        {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bill Info */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                                Hóa đơn được chọn
                            </h2>

                            {selectedBill ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="mb-3">
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Phòng</p>
                                            <p className="text-xl font-bold text-blue-900">{selectedBill.room.name}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-blue-700">Kỳ hạn:</span>
                                            <span className="font-bold text-blue-900">T{selectedBill.month}/{selectedBill.year}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-blue-700">Người thuê:</span>
                                            <span className="font-bold text-blue-900">{selectedBill.contract?.renterRequest?.name || '---'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Tổng hóa đơn</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(selectedBill.amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Đã thanh toán</span>
                                            <span className="font-bold text-emerald-600">{formatCurrency(selectedBill.paid_amount)}</span>
                                        </div>
                                        
                                        {/* Hiển thị số tiền còn lại (đã tính bù trừ payment đang sửa) */}
                                        <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                                            <span className="text-gray-500 text-sm font-medium">Dư nợ tối đa</span>
                                            <span className="font-extrabold text-rose-600">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Trạng thái</span>
                                        {getStatusBadge(selectedBill.status)}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Vui lòng chọn hóa đơn để xem chi tiết</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;