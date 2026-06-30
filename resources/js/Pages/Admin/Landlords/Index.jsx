import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ landlords }) {
    const handleStatusChange = (id, status) => {
        if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái tài khoản chủ trọ này?`)) {
            router.post(route('admin.landlords.update-status', id), { status });
        }
    };

    return (
        <AdminLayout title="Quản lý tài khoản Chủ trọ">
            <Head title="Quản lý Chủ trọ" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Danh sách Chủ trọ</h3>
                        <p className="text-xs text-slate-400 mt-1">Danh sách tất cả các tài khoản chủ trọ đăng ký trên hệ thống</p>
                    </div>
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-xs rounded-lg">
                        Tổng số: {landlords.length} chủ trọ
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Chủ trọ</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Liên hệ</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Quy mô</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gói cước đang dùng</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {landlords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 text-sm font-medium">
                                        Không tìm thấy tài khoản chủ trọ nào trên hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                landlords.map((landlord) => (
                                    <tr key={landlord.id} className="hover:bg-slate-50/50 transition-all">
                                        {/* Tên */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm">
                                                    {landlord.name.charAt(0)}
                                                </div>
                                                <div className="font-bold text-slate-800 text-sm">{landlord.name}</div>
                                            </div>
                                        </td>
                                        
                                        {/* Liên hệ */}
                                        <td className="p-4 text-xs">
                                            <div className="text-slate-700 font-medium">{landlord.email}</div>
                                            <div className="text-slate-400 mt-0.5">{landlord.phone || 'Chưa cập nhật SĐT'}</div>
                                        </td>

                                        {/* Quy mô */}
                                        <td className="p-4 text-xs text-center font-bold text-slate-700">
                                            <div>{landlord.houses_count} Tòa nhà</div>
                                            <div className="text-slate-400 font-normal mt-0.5">{landlord.rooms_count} Phòng</div>
                                        </td>

                                        {/* Gói cước */}
                                        <td className="p-4 text-xs">
                                            {landlord.active_subscription ? (
                                                <div>
                                                    <span className="font-bold text-emerald-600 block">{landlord.active_subscription.package_name}</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5 block">Hạn dùng: {landlord.active_subscription.end_date}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Chưa mua gói (Free Trial)</span>
                                            )}
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="p-4">
                                            {landlord.status === 'active' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                    Hoạt động
                                                </span>
                                            )}
                                            {landlord.status === 'inactive' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                                                    Bị khóa
                                                </span>
                                            )}
                                            {landlord.status === 'pending' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                                    Chờ duyệt
                                                </span>
                                            )}
                                        </td>

                                        {/* Ngày tạo */}
                                        <td className="p-4 text-xs text-slate-500 font-medium">
                                            {landlord.created_at}
                                        </td>

                                        {/* Thao tác */}
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {landlord.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusChange(landlord.id, 'active')}
                                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95"
                                                    >
                                                        Duyệt khoản
                                                    </button>
                                                )}

                                                {landlord.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(landlord.id, 'inactive')}
                                                        className="px-3 py-1.5 border border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
                                                    >
                                                        Khóa khoản
                                                    </button>
                                                )}

                                                {landlord.status === 'inactive' && (
                                                    <button
                                                        onClick={() => handleStatusChange(landlord.id, 'active')}
                                                        className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/10 transition-all active:scale-95"
                                                    >
                                                        Mở khóa
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
