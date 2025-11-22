import { Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { payments } = usePage().props;

    const getMethodBadge = (method) => {
        const styles = {
            cash: 'bg-green-100 text-green-800',
            bank_transfer: 'bg-blue-100 text-blue-800',
            check: 'bg-purple-100 text-purple-800',
            other: 'bg-gray-100 text-gray-800',
        };

        const labels = {
            cash: 'Tiền mặt',
            bank_transfer: 'Chuyển khoản',
            check: 'Séc',
            other: 'Khác',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${styles[method]}`}>
                {labels[method]}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
                <Link
                    href={route('landlord.payments.create')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Ghi nhận thanh toán
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hóa đơn
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phòng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người thuê
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phương thức
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày thanh toán
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        #{payment.bill.month}/{payment.bill.year}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {payment.bill.room.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {payment.bill.renter.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                        +{payment.amount.toLocaleString('vi-VN')} ₫
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getMethodBadge(payment.payment_method)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={route('landlord.payments.show', payment.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Chi tiết
                                    </Link>
                                    <Link
                                        href={route('landlord.payments.edit', payment.id)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Sửa
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route('landlord.payments.destroy', payment.id)}
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                            if (!confirm('Bạn có chắc chắn muốn xóa ghi nhận thanh toán này?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Xóa
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    Chưa có ghi nhận thanh toán nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
