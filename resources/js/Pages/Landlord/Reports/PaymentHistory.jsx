import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PaymentHistory() {
    const { payments, fromDate, toDate, byMethod, totalAmount } = usePage().props;
    const [selectedFromDate, setSelectedFromDate] = useState(fromDate || '');
    const [selectedToDate, setSelectedToDate] = useState(toDate || '');

    const handleFilterPayments = () => {
        const params = new URLSearchParams();
        if (selectedFromDate) params.append('from_date', selectedFromDate);
        if (selectedToDate) params.append('to_date', selectedToDate);
        window.location.href = route('landlord.reports.payments') + '?' + params.toString();
    };

    const getMethodBadge = (method) => {
        const badges = {
            'cash': { bg: 'bg-green-100', text: 'text-green-800', label: 'Tiền mặt' },
            'bank_transfer': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chuyển khoản' },
            'check': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Séc' },
            'other': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Khác' }
        };
        const badge = badges[method] || badges['other'];
        return <span className={`px-3 py-1 rounded text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.dashboard')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại Dashboard
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">Lịch sử thanh toán</h1>

            {/* Bộ lọc ngày */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-end flex-wrap">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={selectedFromDate}
                            onChange={(e) => setSelectedFromDate(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={selectedToDate}
                            onChange={(e) => setSelectedToDate(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleFilterPayments}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Lọc
                    </button>
                    <button
                        onClick={() => {
                            setSelectedFromDate('');
                            setSelectedToDate('');
                            window.location.href = route('landlord.reports.payments');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Tóm tắt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Số lần thanh toán</p>
                    <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Tổng tiền</p>
                    <p className="text-3xl font-bold text-green-600">{totalAmount.toLocaleString('vi-VN')} ₫</p>
                </div>
            </div>

            {/* Thống kê theo phương thức */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Object.keys(byMethod).map((method) => {
                    const data = byMethod[method];
                    const methodLabels = {
                        'cash': 'Tiền mặt',
                        'bank_transfer': 'Chuyển khoản',
                        'check': 'Séc',
                        'other': 'Khác'
                    };
                    return (
                        <div key={method} className="bg-white rounded-lg shadow p-4">
                            <p className="text-gray-600 text-sm">{methodLabels[method]}</p>
                            <p className="text-2xl font-bold text-gray-900">{data.count} lần</p>
                            <p className="text-lg text-green-600 font-medium">{data.total.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    );
                })}
            </div>

            {/* Danh sách thanh toán */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Chi tiết thanh toán</h2>
                </div>
                <div className="overflow-x-auto">
                    {payments.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Hóa đơn</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phòng</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Người thuê</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Số tiền</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Phương thức</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ngày thanh toán</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {payment.bill.month}/{payment.bill.year}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{payment.bill.room.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{payment.bill.contract.renter.name}</td>
                                        <td className="px-6 py-4 text-right font-medium text-green-600">
                                            {payment.amount.toLocaleString('vi-VN')} ₫
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getMethodBadge(payment.payment_method)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {payment.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            Không có dữ liệu thanh toán
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
