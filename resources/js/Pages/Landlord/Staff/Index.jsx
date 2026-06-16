import { Link, Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Index({ staffList, houses }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
            router.delete(route('landlord.staff.destroy', id));
        }
    };

    const statusBadge = (status) => {
        if (status === 'active') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Hoạt động
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
                Tạm dừng
            </span>
        );
    };

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans">
            <Head title="Quản lý nhân viên" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Nhân viên</h1>
                    <p className="text-emerald-600/80 font-medium text-sm mt-1">Quản lý nhân viên và phân quyền nhà trọ</p>
                </div>

                <Link
                    href={route('landlord.staff.create')}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm nhân viên
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                </div>
            </div>

            {/* Table */}
            {filtered.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân viên</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhà được phân công</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(staff => (
                                <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors group">
                                    {/* Avatar + Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{staff.name}</p>
                                                <p className="text-gray-500 text-xs">{staff.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{staff.phone || '—'}</span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {statusBadge(staff.status)}
                                    </td>

                                    {/* Houses */}
                                    <td className="px-6 py-4">
                                        {staff.houses && staff.houses.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {staff.houses.map(h => (
                                                    <span key={h.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-100 text-xs font-medium px-2 py-0.5 rounded-md">
                                                        {h.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Chưa phân công</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={route('landlord.staff.show', staff.id)}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition"
                                                title="Xem chi tiết"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={route('landlord.staff.edit', staff.id)}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                                                title="Chỉnh sửa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(staff.id)}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                                                title="Xóa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-teal-900 mb-1">Chưa có nhân viên nào</h3>
                    <p className="text-gray-500 text-sm mb-6">Thêm nhân viên đầu tiên để bắt đầu phân công quản lý nhà trọ.</p>
                    <Link
                        href={route('landlord.staff.create')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all"
                    >
                        + Thêm nhân viên
                    </Link>
                </div>
            )}
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;
