import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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
        // Auto-fill amount với số tiền còn lại
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
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.payments.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách thanh toán
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Ghi nhận thanh toán</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Chọn hóa đơn *
                        </label>
                        <select
                            value={data.bill_id}
                            onChange={handleBillChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        >
                            <option value="">-- Chọn hóa đơn --</option>
                            {bills.map(bill => (
                                <option key={bill.id} value={bill.id}>
                                    Phòng {bill.room.name} - Tháng {bill.month}/{bill.year} ({(bill.amount - bill.paid_amount).toLocaleString('vi-VN')} ₫ còn lại)
                                </option>
                            ))}
                        </select>
                        {errors.bill_id && (
                            <div className="text-red-600 text-sm mt-1">{errors.bill_id}</div>
                        )}
                    </div>

                    {currentBill && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h3 className="font-semibold mb-2">Thông tin hóa đơn:</h3>
                            <p className="text-sm text-gray-700">Phòng: {currentBill.room.name}</p>
                            <p className="text-sm text-gray-700">Người thuê: {currentBill.renter.name}</p>
                            <p className="text-sm text-gray-700">Tháng: {currentBill.month}/{currentBill.year}</p>
                            <p className="text-sm text-gray-700">Tổng tiền: {currentBill.amount.toLocaleString('vi-VN')} ₫</p>
                            <p className="text-sm text-gray-700">Đã thanh toán: {currentBill.paid_amount.toLocaleString('vi-VN')} ₫</p>
                            <p className="text-sm font-semibold text-blue-900">Còn lại: {remainingAmount.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Số tiền thanh toán *
                            </label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                max={remainingAmount}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                placeholder="0"
                            />
                            {errors.amount && (
                                <div className="text-red-600 text-sm mt-1">{errors.amount}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Ngày thanh toán *
                            </label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={e => setData('payment_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.payment_date && (
                                <div className="text-red-600 text-sm mt-1">{errors.payment_date}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phương thức thanh toán *
                        </label>
                        <select
                            value={data.payment_method}
                            onChange={e => setData('payment_method', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        >
                            <option value="cash">Tiền mặt</option>
                            <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                            <option value="check">Séc</option>
                            <option value="other">Khác</option>
                        </select>
                        {errors.payment_method && (
                            <div className="text-red-600 text-sm mt-1">{errors.payment_method}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mã tham chiếu
                        </label>
                        <input
                            type="text"
                            value={data.reference}
                            onChange={e => setData('reference', e.target.value)}
                            placeholder="Số tài khoản, số séc, ..."
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ghi chú
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            placeholder="Ghi chú thêm về thanh toán..."
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <Link
                            href={route('landlord.payments.index')}
                            className="text-gray-600 hover:underline"
                        >
                            ← Quay lại
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {processing ? 'Đang lưu...' : 'Ghi nhận thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
