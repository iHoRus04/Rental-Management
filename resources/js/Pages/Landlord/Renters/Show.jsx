import { Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { renter } = usePage().props;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.renters.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách người thuê
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{renter.name}</h1>
                        <p className="text-gray-600">Quản lý thông tin người thuê</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                        <dl className="grid grid-cols-[100px,1fr] gap-2">
                            <dt className="text-gray-600">Tên:</dt>
                            <dd className="font-medium">{renter.name}</dd>

                            <dt className="text-gray-600">SĐT:</dt>
                            <dd>{renter.phone}</dd>

                            <dt className="text-gray-600">Email:</dt>
                            <dd>{renter.email || '-'}</dd>

                            <dt className="text-gray-600">CCCD:</dt>
                            <dd>{renter.id_number || '-'}</dd>

                            <dt className="text-gray-600">Địa chỉ:</dt>
                            <dd>{renter.address || '-'}</dd>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Hợp đồng</h2>
                        {renter.contracts && renter.contracts.length > 0 ? (
                            <div className="space-y-2">
                                {renter.contracts.map((contract) => (
                                    <div key={contract.id} className="border rounded p-3 bg-gray-50">
                                        <p className="font-medium">Phòng ID: {contract.room_id}</p>
                                        <p className="text-sm text-gray-600">
                                            Từ: {new Date(contract.start_date).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Đến: {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-sm">
                                            Giá: {contract.monthly_rent.toLocaleString('vi-VN')} ₫/tháng
                                        </p>
                                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                            contract.status === 'active' 
                                                ? 'bg-green-100 text-green-800'
                                                : contract.status === 'terminated'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {contract.status === 'active' ? 'Đang hiệu lực' : 
                                             contract.status === 'terminated' ? 'Đã chấm dứt' : 'Hết hạn'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Chưa có hợp đồng nào</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link
                        href={route('landlord.renters.edit', renter.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ✏ Sửa thông tin
                    </Link>

                    <Link
                        as="button"
                        method="delete"
                        href={route('landlord.renters.destroy', renter.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={(e) => {
                            if (!confirm('Bạn có chắc chắn muốn xóa người thuê này?')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        🗑 Xóa người thuê
                    </Link>
                </div>
            </div>
        </div>
    );
}