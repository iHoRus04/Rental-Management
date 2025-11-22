import { Link, usePage, router } from '@inertiajs/react';
import { useRef } from 'react';

export default function Show() {
    const { bill } = usePage().props;
    const formRef = useRef();
    const { csrf_token } = usePage().props;

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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const remaining = bill.amount - bill.paid_amount;

    const handleExportPDF = () => {
        formRef.current.submit();
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.bills.index')}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại danh sách hóa đơn
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Hóa đơn tháng {bill.month}/{bill.year}
                        </h1>
                        <p className="text-gray-600">
                            Phòng {bill.room.name} - {bill.renter.name}
                        </p>
                    </div>
                    {getStatusBadge(bill.status)}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin hóa đơn</h2>
                        <dl className="grid grid-cols-[120px,1fr] gap-2">
                            <dt className="text-gray-600">Phòng:</dt>
                            <dd className="font-medium">{bill.room.name}</dd>

                            <dt className="text-gray-600">Người thuê:</dt>
                            <dd>{bill.renter.name}</dd>

                            <dt className="text-gray-600">SĐT:</dt>
                            <dd>{bill.renter.phone}</dd>

                            <dt className="text-gray-600">Kỳ:</dt>
                            <dd>Tháng {bill.month}/{bill.year}</dd>

                            <dt className="text-gray-600">Hạn chót:</dt>
                            <dd>{new Date(bill.due_date).toLocaleDateString('vi-VN')}</dd>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Chi tiết thanh toán</h2>
                        <dl className="grid grid-cols-[120px,1fr] gap-2">
                            <dt className="text-gray-600">Số tiền:</dt>
                            <dd className="font-bold text-lg">{bill.amount.toLocaleString('vi-VN')} ₫</dd>

                            <dt className="text-gray-600">Đã thanh toán:</dt>
                            <dd className="font-medium text-green-600">{bill.paid_amount.toLocaleString('vi-VN')} ₫</dd>

                            <dt className="text-gray-600">Còn lại:</dt>
                            <dd className={`font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {remaining.toLocaleString('vi-VN')} ₫
                            </dd>

                            {bill.paid_date && (
                                <>
                                    <dt className="text-gray-600">Ngày thanh toán:</dt>
                                    <dd>{new Date(bill.paid_date).toLocaleDateString('vi-VN')}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Chi tiết chi phí */}
                <div className="bg-gray-50 border border-gray-200 rounded p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Chi tiết chi phí</h2>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-700">Tiền phòng:</span>
                            <span className="font-medium">{bill.room_price.toLocaleString('vi-VN')} ₫</span>
                        </div>

                        {bill.electric_cost > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">
                                    Tiền điện ({bill.electric_kwh} kWh × {bill.electric_price.toLocaleString('vi-VN')} ₫/kWh):
                                </span>
                                <span className="font-medium">{bill.electric_cost.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        {bill.water_cost > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">
                                    Tiền nước ({bill.water_usage} m³ × {bill.water_price.toLocaleString('vi-VN')} ₫/m³):
                                </span>
                                <span className="font-medium">{bill.water_cost.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        {bill.internet_cost > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">Tiền Internet:</span>
                                <span className="font-medium">{bill.internet_cost.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        {bill.trash_cost > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">Tiền rác:</span>
                                <span className="font-medium">{bill.trash_cost.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        {bill.other_costs > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">Chi phí khác:</span>
                                <span className="font-medium">{bill.other_costs.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-3 bg-white rounded px-3 font-bold text-lg mt-2">
                            <span>Tổng cộng:</span>
                            <span className="text-blue-600">{bill.amount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                </div>

                {bill.notes && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
                        <h3 className="font-semibold mb-2">Ghi chú:</h3>
                        <p className="text-gray-700">{bill.notes}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <form 
                        ref={formRef}
                        action={route('landlord.bills.exportPDF', bill.id)} 
                        method="POST"
                        style={{ display: 'none' }}
                    >
                        <input type="hidden" name="_token" value={csrf_token} />
                    </form>
                    
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        📄 Xuất file PDF
                    </button>

                    <Link
                        href={route('landlord.bills.edit', bill.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ✏ Sửa hóa đơn
                    </Link>

                    <Link
                        as="button"
                        method="delete"
                        href={route('landlord.bills.destroy', bill.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={(e) => {
                            if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        🗑 Xóa hóa đơn
                    </Link>
                </div>
            </div>
        </div>
    );
}