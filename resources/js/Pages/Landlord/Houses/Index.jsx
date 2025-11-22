import { Link } from '@inertiajs/react';

export default function Index({ houses }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách Nhà trọ</h1>

            <Link
                    href={route('landlord.houses.create', houses.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Tạo Nhà trọ mới
             </Link>

            <table className="mt-4 w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Tên</th>
                        <th className="p-2">Địa chỉ</th>
                        <th className="p-2">Mô tả</th>
                        <th className="p-2">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {houses.map((house) => (
                        <tr key={house.id} className="border-t">
                            <td className="p-2">{house.name}</td>
                            <td className="p-2">{house.address}</td>
                            <td className="p-2">{house.description}</td>
                            <td className="p-2 space-x-2">
                                <Link
                                    href={route('landlord.houses.edit', house.id)}
                                    className="text-green-600 underline"
                                >
                                    ✏ Sửa
                                </Link>

                                <Link
                                    href={route('landlord.houses.rooms.index', house.id)}
                                    className="text-blue-600 underline"
                                >
                                    🔍 Quản lí 
                                </Link>
                                <Link
                                    as="button"
                                    method="delete"
                                    href={route('landlord.houses.destroy', house.id)}
                                    className="text-red-600 underline"
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
