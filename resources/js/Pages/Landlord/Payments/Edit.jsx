import { Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit() {
    const { payment, bills } = usePage().props;
    const { data, setData, put, errors } = useForm({
        bill_id: payment.bill_id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        reference: payment.reference || '',
        notes: payment.notes || ''
    });

    const [selectedBill, setSelectedBill] = useState(payment.bill);
    const [remainingAmount, setRemainingAmount] = useState(payment.bill.amount - payment.bill.paid_amount + payment.amount);

    const handleBillChange = (e) => {
        const billId = e.target.value;
        setData('bill_id', billId);
        
        const bill = bills.find(b => b.id == billId);
        if (bill) {
            setSelectedBill(bill);
            const remaining = bill.amount - bill.paid_amount + payment.amount;
            setRemainingAmount(remaining);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.payments.update', payment.id), {
            onSuccess: () => {
                window.location.href = route('landlord.payments.show', payment.id);
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { bg: 'bg-red-100', text: 'text-red-800', label: 'Chưa thanh toán' },
            'partial': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Thanh toán một phần' },
            'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán' }
        };
        const badge = badges[status] || badges['pending'];
        return <span className={`px-3 py-1 rounded text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.payments.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách thanh toán
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form chỉnh sửa */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold mb-6">Chỉnh sửa thanh toán</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Hóa đơn */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hóa đơn <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.bill_id}
                                    onChange={handleBillChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    {bills.map((bill) => (
                                        <option key={bill.id} value={bill.id}>
                                            {bill.month}/{bill.year} - {bill.room.name} - {bill.contract.renter.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.bill_id && <p className="text-red-500 text-sm mt-1">{errors.bill_id}</p>}
                            </div>

                            {/* Số tiền */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số tiền <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', parseInt(e.target.value))}
                                    step="1"
                                    max={remainingAmount}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Còn phải thanh toán: {remainingAmount.toLocaleString('vi-VN')} ₫
                                </p>
                                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                            </div>

                            {/* Ngày thanh toán */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày thanh toán <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                                {errors.payment_date && <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>}
                            </div>

                            {/* Phương thức thanh toán */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phương thức thanh toán <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">-- Chọn phương thức --</option>
                                    <option value="cash">Tiền mặt</option>
                                    <option value="bank_transfer">Chuyển khoản</option>
                                    <option value="check">Séc</option>
                                    <option value="other">Khác</option>
                                </select>
                                {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                            </div>

                            {/* Mã tham chiếu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã tham chiếu
                                </label>
                                <input
                                    type="text"
                                    value={data.reference}
                                    onChange={(e) => setData('reference', e.target.value)}
                                    placeholder="VD: Số séc, Mã giao dịch ngân hàng..."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                                {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference}</p>}
                            </div>

                            {/* Ghi chú */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                ></textarea>
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                            </div>

                            {/* Nút submit */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Cập nhật
                                </button>
                                <Link
                                    href={route('landlord.payments.show', payment.id)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-center"
                                >
                                    Hủy
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Thông tin hóa đơn */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Thông tin hóa đơn</h2>
                        
                        {selectedBill && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-600 text-sm">Hóa đơn</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedBill.month}/{selectedBill.year}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Phòng</p>
                                    <p className="font-medium text-gray-900">{selectedBill.room.name}</p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Người thuê</p>
                                    <p className="font-medium text-gray-900">{selectedBill.contract.renter.name}</p>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-gray-600 text-sm">Tổng tiền</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {selectedBill.amount.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Đã thanh toán</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {selectedBill.paid_amount.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Còn phải thanh toán</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {remainingAmount.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-gray-600 text-sm">Trạng thái hóa đơn</p>
                                    {getStatusBadge(selectedBill.status)}
                                </div>

                                <Link
                                    href={route('landlord.bills.show', selectedBill.id)}
                                    className="block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                                >
                                    Xem hóa đơn
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
