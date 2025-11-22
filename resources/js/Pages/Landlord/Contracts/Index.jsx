import { Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { room, contracts } = usePage().props;

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            terminated: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800',
        };

        const labels = {
            active: 'Đang hiệu lực',
            terminated: 'Đã chấm dứt',
            expired: 'Hết hạn',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-sm ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Hợp đồng - Phòng {room.name}
                    </h1>
                    <p className="text-gray-600">
                        {room.house.name}
                    </p>
                </div>

                <Link
                    href={route('landlord.rooms.contracts.create', room.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Tạo hợp đồng mới
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người thuê
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời hạn
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá thuê
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
                        {contracts.map((contract) => (
                            <tr key={contract.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {contract.renter.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {contract.renter.phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(contract.start_date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        đến {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {contract.monthly_rent.toLocaleString('vi-VN')} ₫/tháng
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Đặt cọc: {contract.deposit.toLocaleString('vi-VN')} ₫
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(contract.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Chi tiết
                                    </Link>
                                    <Link
                                        href={route('landlord.rooms.contracts.edit', [room.id, contract.id])}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Sửa
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route('landlord.rooms.contracts.destroy', [room.id, contract.id])}
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                            if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Xóa
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {contracts.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    Chưa có hợp đồng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Link
                    href={route('landlord.houses.rooms.index', [room.house_id, room.id])}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại chi tiết phòng
                </Link>
            </div>
        </div>
    );
}