import { Link, useForm, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { bills, selectedBill } = usePage().props;
    const [selected, setSelected] = useState(selectedBill ? selectedBill.id : '');

    const { data, setData, post, processing, errors } = useForm({
        bill_id: selected,
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference: '',
        notes: '',
    });

    const currentBill = bills.find(b => b.id == data.bill_id);
    const remainingAmount = currentBill ? currentBill.amount - currentBill.paid_amount : 0;

    const handleBillChange = (e) => {
        const billId = e.target.value;
        setData('bill_id', billId);
        setSelected(billId);
        
        // Auto-fill amount
        const bill = bills.find(b => b.id == billId);
        if (bill) {
            const remaining = bill.amount - bill.paid_amount;
            setData('amount', remaining > 0 ? remaining : '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.payments.store'));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Ghi nhận thanh toán" />
            
            <div className="max-w-3xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.payments.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại lịch sử thanh toán
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </span>
                                Ghi nhận thanh toán
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Nhập thông tin thanh toán từ người thuê cho hóa đơn.
                            </p>
                        </div>
                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Chọn Hóa đơn */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Chọn Hóa đơn cần thanh toán
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
                                            <option value="">-- Chọn hóa đơn --</option>
                                            {bills.map(bill => (
                                                <option key={bill.id} value={bill.id}>
                                                    Phòng {bill.room.name} - Tháng {bill.month}/{bill.year} (Còn lại: {(bill.amount - bill.paid_amount).toLocaleString('vi-VN')} ₫)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.bill_id && <p className="text-red-500 text-sm mt-1">{errors.bill_id}</p>}
                                </div>

                                {currentBill && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col gap-3 animate-fade-in relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                                        </div>
                                        
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Thông tin hóa đơn</p>
                                                <h3 className="font-bold text-blue-900 text-lg">{currentBill.room.name} <span className="text-blue-400 font-normal mx-1">|</span> {(currentBill.renterRequest?.name || currentBill.renter_request?.name) || 'N/A'}</h3>
                                                <p className="text-blue-700 text-sm mt-1">Tháng {currentBill.month}/{currentBill.year}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Số tiền còn lại</p>
                                                <p className="text-2xl font-extrabold text-blue-700">{remainingAmount.toLocaleString('vi-VN')} ₫</p>
                                                <p className="text-xs text-blue-400">Tổng: {currentBill.amount.toLocaleString('vi-VN')} ₫</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Chi tiết thanh toán */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Chi tiết thanh toán
                            </h2>

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
                                            placeholder="0"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">đ</div>
                                    </div>
                                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
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

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phương thức thanh toán <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="cash">💵 Tiền mặt</option>
                                            <option value="bank_transfer">🏦 Chuyển khoản ngân hàng</option>
                                            <option value="check">🎫 Séc</option>
                                            <option value="other">🔹 Khác</option>
                                        </select>
                                       
                                    </div>
                                    {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mã tham chiếu (Optional)</label>
                                    <input
                                        type="text"
                                        value={data.reference}
                                        onChange={(e) => setData('reference', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        placeholder="Số tài khoản, mã giao dịch..."
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                        placeholder="Ghi chú thêm về lần thanh toán này..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.payments.index')}
                                className="px-6 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.bill_id}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {processing ? 'Đang lưu...' : 'Xác nhận thanh toán'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;