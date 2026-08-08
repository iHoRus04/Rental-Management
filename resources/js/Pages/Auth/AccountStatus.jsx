import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router, Link } from '@inertiajs/react';

// Inline SVG Icons
const ShieldAlert = ({ className = 'w-16 h-16' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const Hourglass = ({ className = 'w-16 h-16' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CalendarAlert = ({ className = 'w-16 h-16' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 12v3m0 2h.01" />
    </svg>
);

const LogOutIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default function AccountStatus({ status }) {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    const isPending = status === 'pending';
    const isExpired = status === 'expired';

    return (
        <GuestLayout>
            <Head title={isPending ? 'Tài khoản chờ phê duyệt' : isExpired ? 'Gói cước hết hạn' : 'Tài khoản bị khóa'} />

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 w-full max-w-md mx-auto text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {isPending ? (
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-500 animate-pulse">
                            <Hourglass className="w-16 h-16" />
                        </div>
                    ) : isExpired ? (
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-500">
                            <CalendarAlert className="w-16 h-16" />
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-red-50 text-red-500">
                            <ShieldAlert className="w-16 h-16" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
                    {isPending ? 'Đang Chờ Phê Duyệt' : isExpired ? 'Gói Cước Đã Hết Hạn' : 'Tài Khoản Đã Bị Khóa'}
                </h2>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    {isPending ? (
                        'Tài khoản của bạn đã được đăng ký thành công và đang đợi quản trị viên phê duyệt. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ để được kích hoạt nhanh hơn.'
                    ) : isExpired ? (
                        'Gói dịch vụ phần mềm của bạn đã hết hạn sử dụng. Vui lòng gia hạn hoặc đăng ký gói cước mới để tiếp tục quản lý chuỗi nhà trọ của mình.'
                    ) : (
                        'Quyền truy cập của bạn vào hệ thống đã bị tạm ngưng bởi quản trị viên. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật của nền tảng.'
                    )}
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    {isPending && (
                        <a
                            href="mailto:support@dreamhouses.vn"
                            className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                        >
                            Gửi Email Hỗ Trợ
                        </a>
                    )}
                    
                    {isExpired && (
                        <Link
                            href={route('landlord.subscription.index')}
                            className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                        >
                            Gia hạn / Đăng ký gói mới
                        </Link>
                    )}
                    
                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center items-center gap-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 px-4 rounded-xl transition-all"
                    >
                        <LogOutIcon />
                        Đăng xuất tài khoản
                    </button>
                </div>

                <div className="mt-8 text-xs text-slate-400">
                    Hệ thống quản lý nhà trọ DreamHouses © {new Date().getFullYear()}
                </div>
            </div>
        </GuestLayout>
    );
}
