import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';
import NotificationBell from '@/Components/NotificationBell';

export default function TenantLayout({ header, children }) {
    const page = usePage();
    const { auth, flash, systemSettings } = page.props;
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

    // Determine active menu item
    const getActiveView = () => {
        const currentRoute = page.url || '';
        if (currentRoute.includes('/bills')) return 'bills';
        if (currentRoute.includes('/requests')) return 'requests';
        return 'dashboard';
    };

    const activeView = getActiveView();

    const handleSso = async () => {
        setProfileOpen(false);
        const targetOrigin = 'http://localhost:5174';
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/sso-token', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            const token = data?.token;

            // Open external window and send token via postMessage (safer than URL param)
            const popup = window.open(targetOrigin, '_blank');
            if (!popup) {
                // popup blocked — fallback to opening plain site
                window.open(targetOrigin, '_blank');
                return;
            }

            // Try to post message until the window is ready or timeout
            const message = { type: 'sso-token', token };
            let attempts = 0;
            const maxAttempts = 30; // ~6 seconds (200ms interval)
            const interval = setInterval(() => {
                try {
                    popup.postMessage(message, targetOrigin);
                    attempts += 1;
                    if (attempts >= maxAttempts) clearInterval(interval);
                } catch (err) {
                    attempts += 1;
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        try { popup.location.href = targetOrigin; } catch (e) { }
                    }
                }
            }, 200);
        } catch (e) {
            console.error('SSO token fetch failed', e);
            window.open('http://localhost:5174/', '_blank');
        }
    };

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

            const res = await fetch(route('logout'), {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({}),
            });

            console.log('Logout response', res.status, res);
            window.location.href = 'https://dreamhouse-app.onrender.com/login';
        } catch (e) {
            console.error('Logout failed', e);
            window.location.href = 'https://dreamhouse-app.onrender.com/login';
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, route: 'tenant.dashboard' },
        { id: 'bills', label: 'Hóa đơn', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, route: 'tenant.bills.index' },
        { id: 'requests', label: 'Yêu cầu của tôi', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, route: 'tenant.requests.index' },
    ];

    const handleMenuClick = (item) => {
        if (item.route) router.visit(route(item.route));
    };

    return (
        <div className="min-h-screen bg-emerald-50/40 flex font-sans relative overflow-hidden">
            {/* Background Blobs (Fixed) */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-white/80 backdrop-blur-xl border-r border-emerald-100/50 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>

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
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block -mt-1">Tenant Portal</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {menuItems.map((item, idx) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleMenuClick(item)}
                                title={item.label}
                                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                                    : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                            >
                                <span className={`flex-shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>

                                {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
                            </button>
                        );
                    })}
                </div>

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
            </div>

            {/* Main Content Area */}
            <div className={`${sidebarOpen ? 'ml-72' : 'ml-24'} flex-1 transition-all duration-300 flex flex-col relative z-10`}>

                {/* Floating Top Navbar */}
                <nav className="sticky top-0 z-30 px-6 py-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-2xl px-6 py-3 flex items-center justify-between">
                        {/* Left: Title */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <h2 className="text-lg font-bold text-teal-900 capitalize hidden sm:block">
                                {menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}
                            </h2>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-5">
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* Divider */}
                            <div className="h-8 w-[1px] bg-gray-100"></div>

                            {/* User Profile Pill */}
                            <div ref={profileRef} className="flex items-center gap-3 pl-2 group relative">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-teal-900 group-hover:text-emerald-600 transition-colors">{user?.name || 'Khách thuê'}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Khách thuê</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                    <div
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="w-full h-full rounded-full bg-white flex items-center justify-center cursor-pointer"
                                        aria-expanded={profileOpen}
                                    >
                                        <span className="font-bold text-emerald-600 text-lg">{user?.name?.charAt(0) || 'K'}</span>
                                    </div>
                                </div>

                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                        <button
                                            onClick={() => { setProfileOpen(false); router.visit(route('profile.edit')); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-slate-700"
                                        >
                                            Hồ sơ cá nhân
                                        </button>
                                        <button
                                            onClick={handleSso}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-slate-700"
                                        >
                                            Trở về trang chính
                                        </button>
                                        <div className="border-t border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-rose-600 hover:bg-gray-50 text-xs font-bold"
                                        >
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
