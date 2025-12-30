import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function MonthlyRevenue() {
    const { month, year, totalBillAmount, totalPaidAmount, totalUnpaidAmount, billCount, paidPercentage, byRoom, bills } = usePage().props;
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear] = useState(year);

    const handleViewReport = () => {
        window.location.href = route('landlord.reports.monthly', { month: selectedMonth, year: selectedYear });
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

            <h1 className="text-3xl font-bold mb-6">Báo cáo thu nhập hàng tháng</h1>

            {/* Bộ lọc */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tháng
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Năm
                        </label>
                        <input
                            type="number" step="1"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 w-32"
                        />
                    </div>
                    <button
                        onClick={handleViewReport}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Xem báo cáo
                    </button>
                </div>
            </div>

            {/* Tóm tắt */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Số hóa đơn</p>
                    <p className="text-3xl font-bold text-gray-900">{billCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Tổng tiền</p>
                    <p className="text-3xl font-bold text-blue-600">{totalBillAmount.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Đã thu</p>
                    <p className="text-3xl font-bold text-green-600">{totalPaidAmount.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Chưa thu</p>
                    <p className="text-3xl font-bold text-red-600">{totalUnpaidAmount.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</p>
                </div>
            </div>

            {/* Tiến độ thanh toán */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Tỷ lệ thanh toán: {paidPercentage.toFixed(1)}%</h2>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                        className="bg-green-500 h-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ width: `${paidPercentage}%` }}
                    >
                        {paidPercentage > 10 && `${paidPercentage.toFixed(1)}%`}
                    </div>
                </div>
            </div>

            {/* Chi tiết theo phòng */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Chi tiết theo phòng</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phòng</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Tổng tiền</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Đã thu</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Chưa thu</th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byRoom.map((room, idx) => {
                                const percentage = room.total_amount > 0 ? (room.total_paid / room.total_amount) * 100 : 0;
                                return (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{room.room.name}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{room.total_amount.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">{room.total_paid.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</td>
                                        <td className="px-6 py-4 text-right text-red-600">{room.total_unpaid.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded text-sm font-medium ${percentage === 100 ? 'bg-green-100 text-green-800' : percentage > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
