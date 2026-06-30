import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

// Inline Icons
const UsersGroup = () => (
    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const DocumentStack = () => (
    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);

const Coins = () => (
    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export default function Dashboard() {
    return (
        <AdminLayout title="Tổng quan hệ thống">
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-700/25 rounded-full blur-2xl"></div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-2xl font-extrabold mb-2">Chào mừng trở lại, Super Admin!</h2>
                        <p className="text-teal-100/90 text-sm leading-relaxed">
                            Chào mừng bạn đến với bảng điều khiển dành cho Quản trị viên hệ thống quản lý nhà trọ DreamHouses. Hãy quản lý tài khoản chủ trọ, tối ưu hóa các gói dịch vụ và kiểm soát dòng doanh thu phần mềm tổng thể tại đây.
                        </p>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Landlords Manager */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-teal-100 hover:shadow-lg transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 transition-all group-hover:scale-110">
                            <UsersGroup />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Quản lý Chủ trọ</h3>
                        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                            Phê duyệt các tài khoản đăng ký mới, khóa/mở khóa quyền truy cập của chủ trọ và theo dõi thông tin chi tiết về quy mô sử dụng.
                        </p>
                        <Link
                            href={route('admin.landlords.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
                        >
                            Quản lý chủ trọ 
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                    {/* Packages Manager */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-lg transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 transition-all group-hover:scale-110">
                            <DocumentStack />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Gói dịch vụ (Subscription)</h3>
                        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                            Cấu hình các gói dịch vụ bán phần mềm, thiết lập giá tiền, hạn mức phòng tối đa cho chủ trọ đăng ký.
                        </p>
                        <Link
                            href={route('admin.packages.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                            Quản lý gói cước
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                    {/* Revenue Manager */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 transition-all group-hover:scale-110">
                            <Coins />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Báo cáo Doanh thu</h3>
                        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                            Theo dõi tổng doanh thu bán phần mềm, xuất biểu đồ tăng trưởng và xem danh sách lịch sử giao dịch đăng ký gói gần đây.
                        </p>
                        <Link
                            href={route('admin.revenue.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                            Xem doanh thu phần mềm
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
