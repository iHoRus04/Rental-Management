import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { renters } = usePage().props;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý người thuê</h1>
                <Link
                    href={route('landlord.renters.create')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Thêm người thuê
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SĐT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                CCCD/CMND
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hợp đồng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {renters.map((renter) => (
                            <tr key={renter.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {renter.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {renter.phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {renter.email || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {renter.id_number || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {renter.contracts.length} hợp đồng
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={route('landlord.renters.show', renter.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Chi tiết
                                    </Link>
                                    <Link
                                        href={route('landlord.renters.edit', renter.id)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Sửa
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route('landlord.renters.destroy', renter.id)}
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                            if (!confirm('Bạn có chắc chắn muốn xóa người thuê này?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Xóa
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {renters.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Chưa có người thuê nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;