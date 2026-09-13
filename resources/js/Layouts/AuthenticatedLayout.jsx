import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';
import NotificationBell from '@/Components/NotificationBell';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const { auth, flash, systemSettings } = page.props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
    const [pendingRenterRequestsCount, setPendingRenterRequestsCount] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close mobile menu & profile dropdown when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
    }, [page.url]);

    // Fetch pending reminders count (only for landlord and staff)
    useEffect(() => {
        if (user.role !== 'landlord' && user.role !== 'staff') return;

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
    }, [user.role]);

    // Fetch pending renter-requests count (only for landlord and staff)
    useEffect(() => {
        if (user.role !== 'landlord' && user.role !== 'staff') return;

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
    }, [user.role]);

    // Debug: Log flash messages
    useEffect(() => {
        if (flash) {
            console.log('AuthenticatedLayout - Flash Props:', flash);
        }
    }, [flash]);

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
        if (currentRoute.includes('/subscription')) return 'subscription';
        if (currentRoute.includes('/staff')) return 'staff';
        if (currentRoute.includes('/bills')) return 'bills';
        if (currentRoute.includes('/payments')) return 'payments';
        if (currentRoute.includes('/houses')) return 'houses';
        if (currentRoute.includes('/services')) return 'services';
        if (currentRoute.includes('/meter-logs')) return 'meter-logs';
        if (currentRoute.includes('/reminders')) return 'reminders';
        if (currentRoute.includes('/renter-requests')) return 'renter-requests';
        if (currentRoute.includes('/tenant-requests')) return 'tenant-requests';
        if (currentRoute.includes('/rooms')) return 'rooms';

        if (currentRoute.includes('/feedbacks')) return 'feedbacks';
        return 'dashboard';
    };

    const activeView = getActiveView();

    const handleSso = async () => {
        setProfileOpen(false);
        const targetOrigin = 'https://dreamhouse-pied.vercel.app/';
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
                        try { popup.location.href = targetOrigin; } catch (e) { }
                    }
                }
            }, 200);
        } catch (e) {
            console.error('SSO token fetch failed', e);
            window.open('https://dreamhouse-pied.vercel.app//', '_blank');
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

    // Permissions helper — dùng shared data từ Inertia
    const permissions = auth.permissions || [];
    const canDo = (perm) => permissions.includes('*') || permissions.includes(perm);

    // Menu items based on user role
    const getLandlordMenuItems = () => {
        const all = [
            { id: 'dashboard', perm: null, label: 'Dashboard', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, route: 'landlord.dashboard' },
            { id: 'houses', perm: 'houses.view', label: 'Nhà trọ', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, route: 'landlord.houses.index' },
            { id: 'services', perm: 'services.view', label: 'Dịch vụ', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, route: 'landlord.services.index' },
            { id: 'renter-requests', perm: 'renter_requests.view', label: 'Yêu cầu thuê', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, route: 'landlord.renter-requests.index' },
            { id: 'tenant-requests', perm: 'tenant_requests.view', label: 'Yêu cầu từ khách', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>, route: 'landlord.tenant-requests.index' },
            { id: 'meter-logs', perm: 'meter_logs.view', label: 'Điện nước', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, route: 'landlord.meter-logs.index' },
            { id: 'bills', perm: 'bills.view', label: 'Hóa đơn', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, route: 'landlord.bills.index' },
            { id: 'payments', perm: 'payments.view', label: 'Thanh toán', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, route: 'landlord.payments.index' },
            { id: 'reminders', perm: 'reminders.view', label: 'Nhắc nhở', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, route: 'landlord.reminders.index' },
            // Staff & Subscription menu — chỉ hiển thị cho landlord
            ...(user.role === 'landlord' ? [
                { id: 'subscription', perm: null, label: 'Gói dịch vụ', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, route: 'landlord.subscription.index' },
                { id: 'staff', perm: null, label: 'Nhân viên', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, route: 'landlord.staff.index' },
                { id: 'feedbacks', perm: null, label: 'Góp ý', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>, route: 'landlord.feedbacks.index' },
            ] : []),
        ];

        return all.filter(item => !item.perm || canDo(item.perm));
    };

    const getTenantMenuItems = () => [
        { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, route: 'tenant.dashboard' },
        { id: 'bills', label: 'Hóa đơn', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, route: 'tenant.bills.index' },
        { id: 'requests', label: 'Yêu cầu của tôi', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, route: 'tenant.requests.index' },
    ];

    // Get menu items based on role
    const menuItems = user.role === 'tenant' ? getTenantMenuItems() : getLandlordMenuItems();

    const handleMenuClick = (item) => {
        setMobileMenuOpen(false);
        if (item.route) router.visit(route(item.route));
    };

    return (
        <div className="min-h-screen bg-emerald-50/40 flex font-sans relative overflow-x-hidden">
            {/* Background Blobs (Fixed) */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400 opacity-[0.05] rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>

            {/* Mobile Backdrop Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fade-in"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar (Responsive Off-Canvas Drawer on Mobile / Collapsible on Desktop) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 h-full z-50 flex flex-col bg-white/95 backdrop-blur-xl border-r border-emerald-100/60 shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out
                    ${mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                    ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'}
                `}
            >
                {/* Logo Section */}
                <div className="p-4 sm:p-6 flex items-center justify-between border-b border-emerald-50/80 h-20 sm:h-24">
                    <div className="flex items-center gap-3 min-w-0">
                        {systemSettings?.logo ? (
                            <img src={systemSettings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-md flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                        )}
                        {(sidebarOpen || mobileMenuOpen) && (
                            <div className="animate-fade-in truncate">
                                <span className="font-extrabold text-lg sm:text-xl text-teal-900 tracking-tight block truncate">
                                    {systemSettings?.app_name || 'DreamHouses'}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block -mt-0.5">Manager</span>
                            </div>
                        )}
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        aria-label="Đóng menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto py-4 sm:py-6 px-3 sm:px-4 space-y-1.5 scrollbar-thin">
                    {menuItems.map((item, idx) => {
                        const isActive = activeView === item.id;
                        const isExpanded = sidebarOpen || mobileMenuOpen;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleMenuClick(item)}
                                title={item.label}
                                className={`w-full flex items-center ${isExpanded ? 'gap-3.5 px-4' : 'justify-center px-2'} py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 font-bold'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold'
                                    }`}
                            >
                                <span className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>

                                {isExpanded && <span className="text-sm whitespace-nowrap truncate">{item.label}</span>}

                                {/* Reminder Badge */}
                                {item.id === 'reminders' && pendingRemindersCount > 0 && (
                                    <span className={`absolute ${isExpanded ? 'right-3' : 'top-1.5 right-1.5'} bg-rose-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm border-2 border-white`}>
                                        {pendingRemindersCount > 9 ? '9+' : pendingRemindersCount}
                                    </span>
                                )}
                                {/* Renter requests badge */}
                                {item.id === 'renter-requests' && pendingRenterRequestsCount > 0 && (
                                    <span className={`absolute ${isExpanded ? 'right-3' : 'top-1.5 right-1.5'} bg-emerald-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm border-2 border-white`}>
                                        {pendingRenterRequestsCount > 9 ? '9+' : pendingRenterRequestsCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Sidebar Footer/Toggle (Desktop Only) */}
                <div className="p-3 border-t border-emerald-50/80 hidden lg:block">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        title={sidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
                    >
                        <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 relative z-10 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} ml-0`}>

                {/* Floating Top Navbar */}
                <nav className="sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-4">
                    <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-2xl px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
                        {/* Left: Mobile Hamburger & Page Title */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex-shrink-0"
                                aria-label="Mở menu điều hướng"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h2 className="text-base sm:text-lg font-bold text-teal-900 capitalize truncate">
                                {menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}
                            </h2>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* Divider */}
                            <div className="h-6 sm:h-8 w-[1px] bg-gray-200"></div>

                            {/* User Profile Pill */}
                            <div ref={profileRef} className="flex items-center gap-2 sm:gap-3 group relative">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs sm:text-sm font-bold text-teal-900 group-hover:text-emerald-600 transition-colors truncate max-w-[120px]">{user?.name || 'Admin'}</p>
                                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        {user?.role === 'landlord' ? 'Chủ trọ' : user?.role === 'tenant' ? 'Khách thuê' : 'Quản trị viên'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0"
                                    aria-expanded={profileOpen}
                                    aria-label="Tài khoản cá nhân"
                                >
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center cursor-pointer">
                                        <span className="font-bold text-emerald-600 text-sm sm:text-base">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                                    </div>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                                        <div className="p-3 border-b border-gray-50 bg-gray-50/50 sm:hidden">
                                            <p className="font-bold text-sm text-gray-800 truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { setProfileOpen(false); router.visit(route('profile.edit')); }}
                                            className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Hồ sơ cá nhân
                                        </button>
                                        <button
                                            onClick={handleSso}
                                            className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            Chuyển trang Public
                                        </button>
                                        <div className="border-t border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Scrollable Content */}
                <main className="flex-1 px-3 sm:px-6 pb-6 min-w-0">
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
                    animation: fade-in 0.25s ease-out forwards;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.25s ease-out forwards;
                }
            `}</style>
        </div>
    );
}