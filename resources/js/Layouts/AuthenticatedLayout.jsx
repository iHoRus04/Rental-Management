import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const { auth, flash } = page.props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
    const [pendingRenterRequestsCount, setPendingRenterRequestsCount] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Debug: Log flash messages
    useEffect(() => {
        if (flash) {
            console.log('AuthenticatedLayout - Flash Props:', flash);
        }
    }, [flash]);

    // Fetch pending reminders count
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await fetch('/landlord/reminders/pending-count');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setPendingRemindersCount(data.count || 0);
            } catch (error) {
                console.error('Error fetching pending reminders:', error);
            }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 60000);
        return () => clearInterval(interval);
    }, []);

    // Fetch pending renter-requests count (initialize from server-provided stats if available)
    useEffect(() => {
        // Try to use shared props if available (e.g. stats from dashboard)
        try {
            const maybeStats = page.props?.stats;
            if (maybeStats && typeof maybeStats.newRenterRequests !== 'undefined') {
                setPendingRenterRequestsCount(maybeStats.newRenterRequests || 0);
            }
        } catch (e) { /* ignore */ }

        const fetchRenterRequestsCount = async () => {
            try {
                const res = await fetch('/landlord/renter-requests/pending-count');
                if (!res.ok) return; // endpoint may not exist in some envs
                const json = await res.json();
                setPendingRenterRequestsCount(json.count || 0);
            } catch (err) {
                // ignore network errors
            }
        };

        fetchRenterRequestsCount();
        const interval = setInterval(fetchRenterRequestsCount, 60000);
        return () => clearInterval(interval);
    }, []);

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
        if (currentRoute.includes('/payments')) return 'payments';
        if (currentRoute.includes('/houses')) return 'houses';
        if (currentRoute.includes('/meter-logs')) return 'meter-logs';
        if (currentRoute.includes('/reminders')) return 'reminders';
        if (currentRoute.includes('/renter-requests')) return 'renter-requests';
        if (currentRoute.includes('/rooms')) return 'rooms';
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
                    // We still keep trying a few times; external should validate and reply
                    if (attempts >= maxAttempts) clearInterval(interval);
                } catch (err) {
                    // ignore and retry
                    attempts += 1;
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        // fallback: navigate popup to external site if not already
                        try { popup.location.href = targetOrigin; } catch(e){}
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

            // If server invalidated session, reload or redirect externally
            // Prefer external site as requested
            window.location.href = 'http://localhost:5174/';
        } catch (e) {
            console.error('Logout failed', e);
            // Still redirect to external page to ensure user leaves authenticated area
            window.location.href = 'http://localhost:5174/';
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, route: 'landlord.dashboard' },
        { id: 'houses', label: 'Nhà trọ', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, route: 'landlord.houses.index' },
        { id: 'bills', label: 'Hóa đơn', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, route: 'landlord.bills.index' },
        { id: 'payments', label: 'Thanh toán', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, route: 'landlord.payments.index' },
        { id: 'renter-requests', label: 'Yêu cầu thuê', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, route: 'landlord.renter-requests.index' },
        { id: 'meter-logs', label: 'Chỉ số điện nước', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, route: 'landlord.meter-logs.index' },
        { id: 'reminders', label: 'Nhắc nhở', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, route: 'landlord.reminders.index' },
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in">
                                <span className="font-extrabold text-xl text-teal-900 tracking-tight block">DreamHouses</span>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block -mt-1">Manager</span>
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
                                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                                    isActive
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                                        : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >
                                <span className={`flex-shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                
                                {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
                                
                                {/* Reminder Badge */}
                                {item.id === 'reminders' && pendingRemindersCount > 0 && (
                                    <span className={`absolute ${sidebarOpen ? 'right-3' : 'top-2 right-2'} bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border-2 border-white`}>
                                        {pendingRemindersCount > 9 ? '9+' : pendingRemindersCount}
                                    </span>
                                )}
                                {/* Renter requests badge */}
                                {item.id === 'renter-requests' && pendingRenterRequestsCount > 0 && (
                                    <span className={`absolute ${sidebarOpen ? 'right-3' : 'top-2 right-2'} bg-emerald-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border-2 border-white`}>
                                        {pendingRenterRequestsCount > 9 ? '9+' : pendingRenterRequestsCount}
                                    </span>
                                )}
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
                        {/* Left: Breadcrumbs or Title (Placeholder) */}
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
                            <button 
                                onClick={() => router.visit(route('landlord.reminders.index'))}
                                className="relative p-2.5 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all group"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {pendingRemindersCount > 0 && (
                                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="h-8 w-[1px] bg-gray-100"></div>

                            {/* User Profile Pill */}
                            <div ref={profileRef} className="flex items-center gap-3 pl-2 group relative">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-teal-900 group-hover:text-emerald-600 transition-colors">{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quản trị viên</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                    <div
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="w-full h-full rounded-full bg-white flex items-center justify-center cursor-pointer"
                                        aria-expanded={profileOpen}
                                    >
                                         {/* Fallback Avatar */}
                                        <span className="font-bold text-emerald-600 text-lg">{user?.name?.charAt(0) || 'A'}</span>
                                        {/* Nếu có ảnh thật thì dùng img tag ở đây */}
                                    </div>
                                </div>

                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                        <button
                                            onClick={() => { setProfileOpen(false); router.visit(route('profile.edit')); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                        >
                                            Hồ sơ
                                        </button>
                                        <button
                                            onClick={handleSso}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                        >
                                            Trở về trang chính
                                        </button>
                                        <div className="border-t border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-rose-600 hover:bg-gray-50"
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
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}