import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';

// Inline SVG Icons
const HomeIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function AdminLayout({ children, title }) {
    const { auth, pendingFeedbacksCount, systemSettings } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCookie = (name) => {
        const v = `; ${document.cookie}`;
        const parts = v.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const handleLogout = async () => {
        setProfileOpen(false);
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const xsrfCookie = getCookie('XSRF-TOKEN');

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
            };
            if (csrfMeta) headers['X-CSRF-TOKEN'] = csrfMeta;
            if (xsrfCookie) headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie);

            await fetch(route('logout'), {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({}),
            });

            window.location.href = 'https://dreamhouse-app.onrender.com/login';
        } catch (e) {
            console.error('Logout failed', e);
            window.location.href = 'https://dreamhouse-app.onrender.com/login';
        }
    };

    const currentRoute = route().current();

    const navigation = [
        { id: 'dashboard', name: 'Tổng quan', href: route('admin.dashboard'), icon: HomeIcon, active: currentRoute === 'admin.dashboard' },
        { id: 'landlords', name: 'Quản lý Chủ trọ', href: route('admin.landlords.index'), icon: UsersIcon, active: currentRoute?.startsWith('admin.landlords') },
        { id: 'packages', name: 'Quản lý Gói cước', href: route('admin.packages.index'), icon: BriefcaseIcon, active: currentRoute?.startsWith('admin.packages') },
        { id: 'feedbacks', name: 'Góp ý từ Landlord', href: route('admin.feedbacks.index'), icon: ChatIcon, active: currentRoute?.startsWith('admin.feedbacks'), badge: pendingFeedbacksCount },
        { id: 'settings', name: 'Cài đặt hệ thống', href: route('admin.settings.index'), icon: SettingsIcon, active: currentRoute?.startsWith('admin.settings') },
    ];

    return (
        <div className="min-h-screen bg-emerald-50/40 flex font-sans relative overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-white/80 backdrop-blur-xl border-r border-emerald-100/50 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-center border-b border-emerald-50/50 h-24">
                    <div className="flex items-center gap-3">
                        {systemSettings?.logo ? (
                            <img src={systemSettings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-md flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                        )}
                        {sidebarOpen && (
                            <div className="animate-fade-in">
                                <span className="font-extrabold text-xl text-teal-900 tracking-tight block">
                                    {systemSettings?.app_name || 'DreamHouses'}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block -mt-1">Super Admin</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            title={item.name}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${item.active
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                                : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                        >
                            {/* Icon + Badge (khi sidebar thu gọn) */}
                            <span className={`flex-shrink-0 relative transition-transform duration-300 ${!item.active && 'group-hover:scale-110'}`}>
                                <item.icon />
                                {!sidebarOpen && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </span>

                            {/* Tên + Badge (khi sidebar mở rộng) */}
                            {sidebarOpen && (
                                <span className="flex-1 flex items-center justify-between">
                                    <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>
                                    {item.badge > 0 && (
                                        <span className={`min-w-[20px] h-5 px-1.5 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm ${item.active ? 'bg-white/30 text-white' : 'bg-rose-500 text-white animate-pulse'
                                            }`}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer/Toggle */}
                <div className="p-4 border-t border-emerald-50/50">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                        <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`${sidebarOpen ? 'ml-72' : 'ml-24'} flex-1 transition-all duration-300 flex flex-col relative z-10`}>

                {/* Floating Top Navbar */}
                <nav className="sticky top-0 z-30 px-6 py-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-2xl px-6 py-3 flex items-center justify-between">
                        {/* Left Side: Collapse Button and Title */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <h2 className="text-lg font-bold text-teal-900 capitalize hidden sm:block">
                                {title}
                            </h2>
                        </div>

                        {/* Right Side: Profile Dropdown */}
                        <div className="flex items-center gap-5">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                                Admin Platform
                            </span>

                            <div className="h-8 w-[1px] bg-gray-100"></div>

                            <div ref={profileRef} className="flex items-center gap-3 pl-2 group relative">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-teal-900 group-hover:text-emerald-600 transition-colors">{user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                    <div
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="w-full h-full rounded-full bg-white flex items-center justify-center cursor-pointer"
                                        aria-expanded={profileOpen}
                                    >
                                        <span className="font-bold text-emerald-600 text-lg">{user.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>

                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                        <div className="p-4 border-b border-slate-50">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quyền hạn</p>
                                            <p className="text-xs text-slate-600 mt-1 font-bold">Toàn quyền hệ thống</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-rose-600 hover:bg-gray-50 font-bold text-xs flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto px-6 pb-6">
                    {children}
                </main>
            </div>

            {/* Toast Notifications */}
            <Toast />

            {/* Global Animation Style */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
