import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Inline SVG Icons
const HomeIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UsersIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const BriefcaseIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChartIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LogOutIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const ChatIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
);

export default function AdminLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        } else if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
        }

        if (flash?.success || flash?.error || flash?.warning) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const currentRoute = route().current();

    const navigation = [
        { name: 'Tổng quan', href: route('admin.dashboard'), icon: HomeIcon, active: currentRoute === 'admin.dashboard' },
        { name: 'Quản lý Chủ trọ', href: route('admin.landlords.index'), icon: UsersIcon, active: currentRoute?.startsWith('admin.landlords') },
        { name: 'Quản lý Gói cước', href: route('admin.packages.index'), icon: BriefcaseIcon, active: currentRoute?.startsWith('admin.packages') },
        { name: 'Báo cáo Doanh thu', href: route('admin.revenue.index'), icon: ChartIcon, active: currentRoute?.startsWith('admin.revenue') },
        { name: 'Góp ý từ Landlord', href: route('admin.feedbacks.index'), icon: ChatIcon, active: currentRoute?.startsWith('admin.feedbacks') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 animate-bounce shadow-2xl flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 max-w-sm">
                    <div className={`p-2 rounded-xl text-white ${
                        toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}>
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        )}
                        {toast.type === 'error' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {toast.type === 'warning' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">
                            {toast.type === 'success' ? 'Thành công' : toast.type === 'error' ? 'Lỗi' : 'Cảnh báo'}
                        </p>
                        <p className="text-xs text-slate-500">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-white font-extrabold text-xl">
                            D
                        </div>
                        <div>
                            <span className="font-extrabold text-teal-900 tracking-tight text-lg">DreamHouses</span>
                            <span className="block text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Super Admin</span>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Đang đăng nhập</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">{auth.user.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{auth.user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-6 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                item.active
                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 text-emerald-600 border-l-4 border-emerald-500 pl-3'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Logout */}
                <div className="p-6 border-t border-slate-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold text-sm transition-all"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="bg-white border-b border-slate-50 py-5 px-8 shrink-0 flex justify-between items-center">
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                            Platform Active
                        </span>
                    </div>
                </header>

                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
