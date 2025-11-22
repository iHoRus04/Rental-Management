import { Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { renter } = usePage().props;
    
    const { data, setData, put, processing, errors } = useForm({
        name: renter.name,
        phone: renter.phone,
        email: renter.email || '',
        id_number: renter.id_number || '',
        address: renter.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.renters.update', renter.id));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.renters.show', renter.id)}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại chi tiết
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Sửa thông tin người thuê</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tên người thuê *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        />
                        {errors.name && (
                            <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Số điện thoại *
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.phone && (
                                <div className="text-red-600 text-sm mt-1">{errors.phone}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.email && (
                                <div className="text-red-600 text-sm mt-1">{errors.email}</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                CCCD/CMND
                            </label>
                            <input
                                type="text"
                                value={data.id_number}
                                onChange={e => setData('id_number', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.id_number && (
                                <div className="text-red-600 text-sm mt-1">{errors.id_number}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                            />
                            {errors.address && (
                                <div className="text-red-600 text-sm mt-1">{errors.address}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <Link
                            href={route('landlord.renters.show', renter.id)}
                            className="text-gray-600 hover:underline"
                        >
                            ← Quay lại
                        </Link>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {processing ? 'Đang lưu...' : 'Cập nhật'}
                            </button>

                            <Link
                                href={route('landlord.renters.show', renter.id)}
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