import { Link, usePage, router } from '@inertiajs/react';

export default function Index() {
    const { bills } = usePage().props;

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-200 text-red-900',
        };

        const labels = {
            pending: 'Chưa thanh toán',
            partial: 'Thanh toán một phần',
            paid: 'Đã thanh toán',
            overdue: 'Quá hạn',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleGenerateMonthly = () => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        if (confirm(`Tạo hóa đơn cho tháng ${currentMonth}/${currentYear}?`)) {
            router.post(route('landlord.bills.generateMonthly'), {
                month: currentMonth,
                year: currentYear
            });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerateMonthly}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                        ⚙ Tạo hóa đơn hàng tháng
                    </button>
                    <Link
                        href={route('landlord.bills.create')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        + Tạo hóa đơn mới
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phòng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người thuê
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kỳ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đã thanh toán
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hạn chót
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bills.map((bill) => (
                            <tr key={bill.id} className={bill.status === 'overdue' ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {bill.room.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {bill.renter.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        Tháng {bill.month}/{bill.year}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {bill.amount.toLocaleString('vi-VN')} ₫
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {bill.paid_amount.toLocaleString('vi-VN')} ₫
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {new Date(bill.due_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(bill.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={route('landlord.bills.show', bill.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Chi tiết
                                    </Link>
                                    <Link
                                        href={route('landlord.bills.edit', bill.id)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Sửa
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route('landlord.bills.destroy', bill.id)}
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                            if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Xóa
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {bills.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                    Chưa có hóa đơn nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}