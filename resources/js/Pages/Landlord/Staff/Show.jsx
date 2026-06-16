import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ staff, houses }) {
    const handleAssignHouse = (houseId) => {
        router.post(route('landlord.staff.houses.assign', staff.id), { house_id: houseId });
    };

    const handleRemoveHouse = (houseId) => {
        if (confirm('Bỏ phân công nhà trọ này cho nhân viên?')) {
            router.delete(route('landlord.staff.houses.remove', { staff: staff.id, house: houseId }));
        }
    };

    const assignedIds = staff.houses ? staff.houses.map(h => h.id) : [];
    const unassigned = houses.filter(h => !assignedIds.includes(h.id));

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans">
            <Head title={`Nhân viên - ${staff.name}`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                        {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-teal-900">{staff.name}</h1>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                    </div>
                </div>
                <Link
                    href={route('landlord.staff.edit', staff.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition border border-emerald-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Thông tin */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin</h2>

                    <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Số điện thoại</p>
                        <p className="text-sm font-semibold text-gray-800">{staff.phone || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Trạng thái</p>
                        {staff.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Hoạt động
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                Tạm dừng
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Ngày tạo</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {new Date(staff.created_at).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                </div>

                {/* Nhà trọ được phân công */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">
                            Nhà trọ được phân công ({staff.houses?.length || 0})
                        </h2>

                        {staff.houses && staff.houses.length > 0 ? (
                            <div className="space-y-2">
                                {staff.houses.map(house => (
                                    <div key={house.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span className="text-sm font-semibold text-emerald-800">{house.name}</span>
                                            {house.assigned_at && (
                                                <span className="text-xs text-emerald-500">
                                                    • {new Date(house.assigned_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveHouse(house.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition"
                                            title="Gỡ phân công"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Chưa phân công nhà trọ nào</p>
                        )}
                    </div>

                    {/* Thêm nhà trọ */}
                    {unassigned.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Thêm phân công</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {unassigned.map(house => (
                                    <button
                                        key={house.id}
                                        onClick={() => handleAssignHouse(house.id)}
                                        className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 text-sm font-medium transition text-left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        {house.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Back */}
            <div className="mt-6">
                <Link
                    href={route('landlord.staff.index')}
                    className="text-sm text-gray-500 hover:text-emerald-600 transition font-medium"
                >
                    ← Quay lại danh sách
                </Link>
            </div>
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;
