import { Link, usePage } from '@inertiajs/react';

export default function YearToDateRevenue() {
    const { year, yearData } = usePage().props;

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

            <h1 className="text-3xl font-bold mb-6">Báo cáo thu nhập năm {year}</h1>

            {/* Tóm tắt năm */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Tổng tiền cả năm</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {yearData.reduce((sum, m) => sum + m.total_billed, 0).toLocaleString('vi-VN')} ₫
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Đã thu cả năm</p>
                    <p className="text-3xl font-bold text-green-600">
                        {yearData.reduce((sum, m) => sum + m.total_paid, 0).toLocaleString('vi-VN')} ₫
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Chưa thu cả năm</p>
                    <p className="text-3xl font-bold text-red-600">
                        {yearData.reduce((sum, m) => sum + m.total_unpaid, 0).toLocaleString('vi-VN')} ₫
                    </p>
                </div>
            </div>

            {/* Bảng chi tiết theo tháng */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Chi tiết theo tháng</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tháng</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Số HĐ</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Tổng tiền</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Đã thu</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Chưa thu</th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yearData.map((monthData, idx) => {
                                const percentage = monthData.total_billed > 0 
                                    ? (monthData.total_paid / monthData.total_billed) * 100 
                                    : 0;
                                return (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{monthData.month_name}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{monthData.bill_count}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{monthData.total_billed.toLocaleString('vi-VN')} ₫</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">{monthData.total_paid.toLocaleString('vi-VN')} ₫</td>
                                        <td className="px-6 py-4 text-right text-red-600">{monthData.total_unpaid.toLocaleString('vi-VN')} ₫</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold border-t-2">
                            <tr>
                                <td className="px-6 py-4">Tổng năm</td>
                                <td className="px-6 py-4 text-right">
                                    {yearData.reduce((sum, m) => sum + m.bill_count, 0)}
                                </td>
                                <td className="px-6 py-4 text-right text-blue-600">
                                    {yearData.reduce((sum, m) => sum + m.total_billed, 0).toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-6 py-4 text-right text-green-600">
                                    {yearData.reduce((sum, m) => sum + m.total_paid, 0).toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-6 py-4 text-right text-red-600">
                                    {yearData.reduce((sum, m) => sum + m.total_unpaid, 0).toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {((yearData.reduce((sum, m) => sum + m.total_paid, 0) / yearData.reduce((sum, m) => sum + m.total_billed, 0)) * 100).toFixed(0)}%
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
