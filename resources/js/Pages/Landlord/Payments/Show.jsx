import { Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show() {
    const { payment } = usePage().props;
    const { delete: destroy } = useForm();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        destroy(route('landlord.payments.destroy', payment.id), {
            onSuccess: () => {
                window.location.href = route('landlord.payments.index');
            }
        });
    };

    const getMethodBadge = (method) => {
        const badges = {
            'cash': { bg: 'bg-green-100', text: 'text-green-800', label: 'Tiền mặt' },
            'bank_transfer': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chuyển khoản' },
            'check': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Séc' },
            'other': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Khác' }
        };
        const badge = badges[method] || badges['other'];
        return <span className={`px-4 py-2 rounded text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { bg: 'bg-red-100', text: 'text-red-800', label: 'Chưa thanh toán' },
            'partial': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Thanh toán một phần' },
            'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán' }
        };
        const badge = badges[status] || badges['pending'];
        return <span className={`px-4 py-2 rounded text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.payments.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách thanh toán
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chi tiết thanh toán */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-3xl font-bold mb-4">Chi tiết thanh toán</h1>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Mã thanh toán</p>
                                    <p className="text-lg font-medium text-gray-900">#{payment.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Ngày thanh toán</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-600 text-sm">Phương thức thanh toán</p>
                                {getMethodBadge(payment.payment_method)}
                            </div>

                            {payment.reference && (
                                <div>
                                    <p className="text-gray-600 text-sm">Mã tham chiếu</p>
                                    <p className="text-lg font-medium text-gray-900">{payment.reference}</p>
                                </div>
                            )}

                            {payment.notes && (
                                <div>
                                    <p className="text-gray-600 text-sm">Ghi chú</p>
                                    <p className="text-gray-900">{payment.notes}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <p className="text-gray-600 text-sm">Số tiền thanh toán</p>
                                <p className="text-4xl font-bold text-green-600">
                                    {payment.amount.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-gray-600 text-sm">Ngày ghi nhận</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(payment.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hành động */}
                    <div className="flex gap-2">
                        <Link
                            href={route('landlord.payments.edit', payment.id)}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                        >
                            Sửa
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Xóa
                        </button>
                    </div>

                    {/* Modal xác nhận xóa */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
                                <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
                                <p className="text-gray-600 mb-6">
                                    Bạn có chắc chắn muốn xóa thanh toán này? Hóa đơn sẽ được cập nhật lại.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thông tin hóa đơn */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Thông tin hóa đơn</h2>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-600 text-sm">Hóa đơn</p>
                                <p className="font-medium text-gray-900">
                                    {payment.bill.month}/{payment.bill.year}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-600 text-sm">Phòng</p>
                                <p className="font-medium text-gray-900">{payment.bill.room.name}</p>
                            </div>

                            <div>
                                <p className="text-gray-600 text-sm">Người thuê</p>
                                <p className="font-medium text-gray-900">{payment.bill.contract.renter.name}</p>
                            </div>

                            <div className="pt-3 border-t">
                                <p className="text-gray-600 text-sm">Tổng tiền</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {payment.bill.amount.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-600 text-sm">Đã thanh toán</p>
                                <p className="text-xl font-bold text-green-600">
                                    {payment.bill.paid_amount.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-600 text-sm">Còn phải thanh toán</p>
                                <p className="text-xl font-bold text-red-600">
                                    {(payment.bill.amount - payment.bill.paid_amount).toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            <div className="pt-3 border-t">
                                <p className="text-gray-600 text-sm">Trạng thái hóa đơn</p>
                                {getStatusBadge(payment.bill.status)}
                            </div>

                            <Link
                                href={route('landlord.bills.show', payment.bill.id)}
                                className="block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                            >
                                Xem hóa đơn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
