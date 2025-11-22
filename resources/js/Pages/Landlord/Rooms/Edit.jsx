import { Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { house, room } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        name: room.name,
        price: room.price,
        status: room.status,
        floor: room.floor || '',
        area: room.area || '',
        description: room.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.houses.rooms.update', [house.id, room.id]));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={route('landlord.houses.rooms.index', [house.id, room.id])}
                    className="text-blue-600 hover:underline"
                >
                    ← Quay lại chi tiết phòng
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">
                    Chỉnh sửa phòng: {room.name}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tên phòng
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.name && (
                            <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Giá thuê (VNĐ/tháng)
                        </label>
                        <input
                            type="number"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.price && (
                            <div className="text-red-600 text-sm mt-1">{errors.price}</div>
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
                            <option value="available">Còn trống</option>
                            <option value="occupied">Đã cho thuê</option>
                            <option value="maintenance">Đang sửa chữa</option>
                        </select>
                        {errors.status && (
                            <div className="text-red-600 text-sm mt-1">{errors.status}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tầng
                        </label>
                        <input
                            type="number"
                            value={data.floor}
                            onChange={e => setData('floor', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.floor && (
                            <div className="text-red-600 text-sm mt-1">{errors.floor}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Diện tích (m²)
                        </label>
                        <input
                            type="number"
                            value={data.area}
                            onChange={e => setData('area', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.area && (
                            <div className="text-red-600 text-sm mt-1">{errors.area}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mô tả
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.description && (
                            <div className="text-red-600 text-sm mt-1">{errors.description}</div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>

                        <Link
                            href={route('landlord.houses.rooms.show', [house.id, room.id])}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Hủy
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}