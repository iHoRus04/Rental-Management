import { Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { room, contract } = usePage().props;

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
            <span className={`px-3 py-1 rounded-full text-sm ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleTerminate = (e) => {
        e.preventDefault();
        put(route('landlord.rooms.contracts.update', [room.id, contract.id]), {
            onSuccess: () => setShowTerminateModal(false),
        });
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.rooms.contracts.index', room.id)}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách hợp đồng
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Chi tiết hợp đồng thuê phòng
                        </h1>
                        <p className="text-gray-600">
                            Phòng {room.name} - {room.house.name}
                        </p>
                    </div>
                    {getStatusBadge(contract.status)}
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                        <dl className="grid grid-cols-[120px,1fr] gap-2">
                            <dt className="text-gray-600">Người thuê:</dt>
                            <dd className="font-medium">{contract.renter.name}</dd>

                            <dt className="text-gray-600">Liên hệ:</dt>
                            <dd>{contract.renter.phone}</dd>

                            <dt className="text-gray-600">Email:</dt>
                            <dd>{contract.renter.email}</dd>

                            <dt className="text-gray-600">Ngày bắt đầu:</dt>
                            <dd>{new Date(contract.start_date).toLocaleDateString('vi-VN')}</dd>

                            <dt className="text-gray-600">Ngày kết thúc:</dt>
                            <dd>{new Date(contract.end_date).toLocaleDateString('vi-VN')}</dd>

                            <dt className="text-gray-600">Giá thuê:</dt>
                            <dd>{contract.monthly_rent.toLocaleString('vi-VN')} ₫/tháng</dd>

                            <dt className="text-gray-600">Tiền cọc:</dt>
                            <dd>{contract.deposit.toLocaleString('vi-VN')} ₫</dd>

                            <dt className="text-gray-600">Ngày trả tiền:</dt>
                            <dd>Ngày {contract.payment_date} hàng tháng</dd>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Điều khoản hợp đồng</h2>
                        <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-mono text-sm">
                            {contract.terms}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link
                        href={route('landlord.rooms.contracts.edit', [room.id, contract.id])}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ✏ Sửa hợp đồng
                    </Link>

                    {contract.status === 'active' && (
                        <Link
                            as="button"
                            method="put"
                            href={route('landlord.rooms.contracts.update', [room.id, contract.id])}
                            data={{ status: 'terminated' }}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                            onClick={(e) => {
                                if (!confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng này?')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            ⚠ Chấm dứt hợp đồng
                        </Link>
                    )}

                    <Link
                        as="button"
                        method="delete"
                        href={route('landlord.rooms.contracts.destroy', [room.id, contract.id])}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={(e) => {
                            if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        🗑 Xóa hợp đồng
                    </Link>
                </div>
            </div>
        </div>
    );
}