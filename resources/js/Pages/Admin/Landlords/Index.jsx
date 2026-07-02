import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

// Icons
const SearchIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

export default function Index({ landlords }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [packageFilter, setPackageFilter] = useState('all');

    const handleStatusChange = (id, status) => {
        if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái tài khoản chủ trọ này?`)) {
            router.post(route('admin.landlords.update-status', id), { status });
        }
    };

    const filteredLandlords = useMemo(() => {
        return landlords.filter(landlord => {
            const query = searchTerm.toLowerCase();
            const matchesSearch =
                landlord.name.toLowerCase().includes(query) ||
                landlord.email.toLowerCase().includes(query) ||
                (landlord.phone && landlord.phone.includes(query)) ||
                (landlord.active_subscription && landlord.active_subscription.package_name.toLowerCase().includes(query));

            const matchesStatus = statusFilter === 'all' || landlord.status === statusFilter;

            const hasPackage = !!landlord.active_subscription;
            const matchesPackage =
                packageFilter === 'all' ||
                (packageFilter === 'active' && hasPackage) ||
                (packageFilter === 'none' && !hasPackage);

            return matchesSearch && matchesStatus && matchesPackage;
        });
    }, [landlords, searchTerm, statusFilter, packageFilter]);

    return (
        <AdminLayout title="Quản lý tài khoản Chủ trọ">
            <Head title="Quản lý Chủ trọ" />

            <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Left: Search input */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Tìm chủ trọ, email, gói..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-100 hover:bg-slate-50 focus:bg-white text-xs rounded-xl px-4 py-2.5 pl-9 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                        />
                        <div className="absolute left-3 top-3">
                            <SearchIcon />
                        </div>
                    </div>

                    {/* Right: Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50/50 border border-slate-100 text-xs font-semibold text-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                            <option value="all">Trạng thái: Tất cả</option>
                            <option value="active">Hoạt động</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="inactive">Bị khóa</option>
                        </select>

                        <select
                            value={packageFilter}
                            onChange={(e) => setPackageFilter(e.target.value)}
                            className="bg-slate-50/50 border border-slate-100 text-xs font-semibold text-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                            <option value="all">Gói dịch vụ: Tất cả</option>
                            <option value="active">Đã đăng ký gói</option>
                            <option value="none">Chưa đăng ký (Free Trial)</option>
                        </select>

                        <span className="hidden sm:inline-block h-6 w-[1px] bg-slate-100 mx-1"></span>

                        <span className="px-3 py-2 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl">
                            {filteredLandlords.length} kết quả
                        </span>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40">
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Chủ trọ</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Liên hệ</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Quy mô</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Gói cước đang dùng</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày tạo</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLandlords.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-slate-400 text-xs font-medium">
                                            Không tìm thấy tài khoản chủ trọ nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLandlords.map((landlord) => (
                                        <tr key={landlord.id} className="hover:bg-slate-50/40 transition-all">
                                            {/* Tên */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm uppercase">
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
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link
                                                        href={route('admin.landlords.show', landlord.id)}
                                                        className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-xl transition-all shadow-sm"
                                                        title="Xem chi tiết"
                                                    >
                                                        <EyeIcon />
                                                    </Link>

                                                    {landlord.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange(landlord.id, 'active')}
                                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}

                                                    {landlord.status === 'active' && (
                                                        <button
                                                            onClick={() => handleStatusChange(landlord.id, 'inactive')}
                                                            className="px-3 py-1.5 border border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
                                                        >
                                                            Khóa
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
            </div>
        </AdminLayout>
    );
}
