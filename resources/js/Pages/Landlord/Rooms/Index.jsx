import { Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { house, rooms } = usePage().props;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Danh sách phòng {house.name}
            </h1>

            <Link
                href={route('landlord.houses.rooms.create', house.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                + Thêm phòng
            </Link>

            <table className="mt-6 w-full border text-center">
                <thead>
                    <tr className="bg-gray-100">
                        <th>Tên phòng</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th>Tầng</th>
                        <th>Diện tích (m<sup>2</sup>)</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>

                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                        <tr key={room.id} className="border-t">
                            <td >{room.name}</td>
                            <td>{room.price} ₫</td>
                            <td>{room.status}</td>
                            <td>{room.floor}</td>
                            <td>{room.area}</td>
                            <td>{room.description}</td>
                            <td>
                                <Link
                                    href={route('landlord.rooms.contracts.index', [ room.id])}
                                    className="text-green-600 underline mr-2"
                                >
                                    Hợp đồng
                                </Link>
                                <Link
                                    href={route('landlord.houses.rooms.edit', [house.id, room.id])}
                                    className="text-green-600 underline mr-2"
                                >
                                    ✏ Sửa
                                </Link>
                                <Link
                                    method='delete'
                                    href={route('landlord.houses.rooms.destroy', [house.id, room.id])}
                                    className="text-red-600 underline mr-2"
                                >
                                    🗑 Xóa
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
