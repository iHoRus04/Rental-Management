import { Link, router, usePage } from '@inertiajs/react';

export default function Show() {
    const { reminder } = usePage().props;

    const handleMarkAsSent = () => {
        if (confirm('Đánh dấu nhắc nhở này là đã gửi?')) {
            router.post(route('landlord.reminders.markAsSent', reminder.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
            router.delete(route('landlord.reminders.destroy', reminder.id));
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            payment: 'bg-blue-100 text-blue-800',
            contract_expiry: 'bg-orange-100 text-orange-800',
        };

        const labels = {
            payment: 'Thanh toán',
            contract_expiry: 'Hết hạn hợp đồng',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type]}`}>
                {labels[type]}
            </span>
        );
    };

    const getStatusBadge = () => {
        const today = new Date();
        const reminderDate = new Date(reminder.reminder_date);

        if (reminder.is_sent) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Đã gửi</span>;
        }

        if (reminderDate <= today) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Cần xử lý</span>;
        }

        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Sắp tới</span>;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.reminders.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách nhắc nhở
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Chi tiết nhắc nhở</h1>
                        <div className="flex gap-2">
                            {getTypeBadge(reminder.type)}
                            {getStatusBadge()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!reminder.is_sent && (
                            <button
                                onClick={handleMarkAsSent}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                ✓ Đánh dấu đã gửi
                            </button>
                        )}
                        <Link
                            href={route('landlord.reminders.edit', reminder.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Chỉnh sửa
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Xóa
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin nhắc nhở</h2>
                        <dl className="grid grid-cols-[140px,1fr] gap-3">
                            <dt className="text-gray-600">Ngày nhắc nhở:</dt>
                            <dd className="font-medium">
                                {new Date(reminder.reminder_date).toLocaleDateString('vi-VN')}
                            </dd>

                            <dt className="text-gray-600">Loại:</dt>
                            <dd>{getTypeBadge(reminder.type)}</dd>

                            <dt className="text-gray-600">Trạng thái:</dt>
                            <dd>{getStatusBadge()}</dd>

                            <dt className="text-gray-600">Ngày tạo:</dt>
                            <dd className="text-gray-900">
                                {new Date(reminder.created_at).toLocaleString('vi-VN')}
                            </dd>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin hợp đồng</h2>
                        <dl className="grid grid-cols-[140px,1fr] gap-3">
                            <dt className="text-gray-600">Người thuê:</dt>
                            <dd className="font-medium">{reminder.contract.renter.name}</dd>

                            <dt className="text-gray-600">Liên hệ:</dt>
                            <dd>{reminder.contract.renter.phone}</dd>

                            <dt className="text-gray-600">Phòng:</dt>
                            <dd>{reminder.contract.room.name}</dd>

                            <dt className="text-gray-600">Nhà:</dt>
                            <dd>{reminder.contract.room.house.name}</dd>

                            <dt className="text-gray-600">Giá thuê:</dt>
                            <dd>{reminder.contract.monthly_rent.toLocaleString('vi-VN')} ₫/tháng</dd>

                            <dt className="text-gray-600">Hợp đồng:</dt>
                            <dd>
                                {new Date(reminder.contract.start_date).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(reminder.contract.end_date).toLocaleDateString('vi-VN')}
                            </dd>
                        </dl>
                    </div>
                </div>

                {reminder.message && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-3">Nội dung nhắc nhở</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 whitespace-pre-wrap">{reminder.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
