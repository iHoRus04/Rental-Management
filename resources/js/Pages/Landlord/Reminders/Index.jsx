import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
    const { reminders, filters } = usePage().props;
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');

    const handleFilterChange = (type, status) => {
        router.get(route('landlord.reminders.index'), {
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        handleFilterChange(newType, selectedStatus);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        handleFilterChange(selectedType, newStatus);
    };

    const handleMarkAsSent = (reminderId) => {
        if (confirm('Đánh dấu nhắc nhở này là đã gửi?')) {
            router.post(route('landlord.reminders.markAsSent', reminderId), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (reminderId) => {
        if (confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
            router.delete(route('landlord.reminders.destroy', reminderId));
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            payment: 'bg-blue-100 text-blue-800',
            contract_expiry: 'bg-orange-100 text-orange-800',
        };

        const labels = {
            payment: 'Thanh toán',
            contract_expiry: 'Hết hạn HĐ',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
                {labels[type]}
            </span>
        );
    };

    const getStatusBadge = (reminder) => {
        const today = new Date();
        const reminderDate = new Date(reminder.reminder_date);

        if (reminder.is_sent) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã gửi</span>;
        }

        if (reminderDate <= today) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cần xử lý</span>;
        }

        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Sắp tới</span>;
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Nhắc nhở & Thông báo</h1>
                <Link
                    href={route('landlord.reminders.create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Tạo nhắc nhở mới
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại nhắc nhở
                        </label>
                        <select
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="all">Tất cả</option>
                            <option value="payment">Thanh toán</option>
                            <option value="contract_expiry">Hết hạn hợp đồng</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Cần xử lý</option>
                            <option value="upcoming">Sắp tới</option>
                            <option value="sent">Đã gửi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reminders List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {reminders.data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Không có nhắc nhở nào
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ngày nhắc
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Hợp đồng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nội dung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reminders.data.map((reminder) => (
                                <tr key={reminder.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(reminder.reminder_date).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(reminder.type)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {reminder.contract.renter.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {reminder.contract.room.name} - {reminder.contract.room.house.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {reminder.message || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(reminder)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {!reminder.is_sent && (
                                            <button
                                                onClick={() => handleMarkAsSent(reminder.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                ✓ Đã gửi
                                            </button>
                                        )}
                                        <Link
                                            href={route('landlord.reminders.edit', reminder.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(reminder.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {reminders.links.length > 3 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{reminders.from}</span> đến{' '}
                                <span className="font-medium">{reminders.to}</span> trong tổng số{' '}
                                <span className="font-medium">{reminders.total}</span> kết quả
                            </div>
                            <div className="flex space-x-2">
                                {reminders.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
