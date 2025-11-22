import { Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { room, contract, renters } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        renter_id: contract.renter_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        deposit: contract.deposit,
        payment_date: contract.payment_date,
        status: contract.status,
        terms: contract.terms,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.rooms.contracts.update', [room.id, contract.id]));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Chỉnh sửa hợp đồng
                    </h1>
                    <p className="text-gray-600">
                        Phòng {room.name} - {room.house.name}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Người thuê
                            </label>
                            <select
                                value={data.renter_id}
                                onChange={e => setData('renter_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Chọn người thuê</option>
                                {renters.map(renter => (
                                    <option key={renter.id} value={renter.id}>
                                        {renter.name} - {renter.phone}
                                    </option>
                                ))}
                            </select>
                            {errors.renter_id && (
                                <div className="text-red-600 text-sm mt-1">{errors.renter_id}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Trạng thái
                            </label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="active">Đang hiệu lực</option>
                                <option value="terminated">Đã chấm dứt</option>
                                <option value="expired">Hết hạn</option>
                            </select>
                            {errors.status && (
                                <div className="text-red-600 text-sm mt-1">{errors.status}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.start_date && (
                                <div className="text-red-600 text-sm mt-1">{errors.start_date}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.end_date && (
                                <div className="text-red-600 text-sm mt-1">{errors.end_date}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Giá thuê hàng tháng (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={data.monthly_rent}
                                onChange={e => setData('monthly_rent', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.monthly_rent && (
                                <div className="text-red-600 text-sm mt-1">{errors.monthly_rent}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tiền đặt cọc (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={data.deposit}
                                onChange={e => setData('deposit', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.deposit && (
                                <div className="text-red-600 text-sm mt-1">{errors.deposit}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Ngày thanh toán hàng tháng
                            </label>
                            <select
                                value={data.payment_date}
                                onChange={e => setData('payment_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Ngày {i + 1}
                                    </option>
                                ))}
                            </select>
                            {errors.payment_date && (
                                <div className="text-red-600 text-sm mt-1">{errors.payment_date}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Điều khoản hợp đồng
                        </label>
                        <textarea
                            value={data.terms}
                            onChange={e => setData('terms', e.target.value)}
                            rows={15}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                        />
                        {errors.terms && (
                            <div className="text-red-600 text-sm mt-1">{errors.terms}</div>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <Link
                            href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
                            className="text-gray-600 hover:underline"
                        >
                            ← Quay lại chi tiết hợp đồng
                        </Link>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {processing ? 'Đang lưu...' : 'Cập nhật hợp đồng'}
                            </button>

                            <Link
                                href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Hủy
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}