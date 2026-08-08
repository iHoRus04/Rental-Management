import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Custom inline SVG icons for notifications
const CrownIcon = () => (
    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
);
const DocIcon = () => (
    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const CashIcon = () => (
    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export default function NotificationBell() {
    const [pendingCount, setPendingCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchPendingCount();
        
        // Refresh every 5 minutes
        const interval = setInterval(fetchPendingCount, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchPendingCount = () => {
        fetch(route('landlord.reminders.pendingCount'))
            .then(res => res.json())
            .then(data => {
                setPendingCount(data.count);
                setNotifications(data.notifications || []);
            })
            .catch(err => console.error('Error fetching reminders:', err));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-500 hover:text-emerald-600 focus:outline-none transition-colors"
                title="Thông báo hệ thống"
            >
                {/* Bell Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Badge */}
                {pendingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 text-[9px] font-extrabold rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm animate-pulse">
                        {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl z-50 border border-slate-100 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <h3 className="text-sm font-extrabold text-slate-800">Thông báo</h3>
                            {pendingCount > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-600 rounded-lg">
                                    {pendingCount} mới
                                </span>
                            )}
                        </div>
                        
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                    Không có thông báo mới
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <Link
                                        key={idx}
                                        href={notif.url}
                                        onClick={() => setShowDropdown(false)}
                                        className="p-4 flex gap-3 hover:bg-slate-50/50 transition-colors duration-150 text-left block"
                                    >
                                        {/* Dynamic Icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            notif.type === 'subscription' 
                                                ? (notif.is_danger ? 'bg-rose-50' : 'bg-rose-50') 
                                                : (notif.title.includes('hợp đồng') ? 'bg-amber-50' : 'bg-emerald-50')
                                        }`}>
                                            {notif.type === 'subscription' ? <CrownIcon /> : (notif.title.includes('hợp đồng') ? <DocIcon /> : <CashIcon />)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h5 className={`text-xs font-extrabold leading-none ${
                                                notif.type === 'subscription' ? 'text-rose-600' : 'text-slate-800'
                                            }`}>
                                                {notif.title}
                                            </h5>
                                            <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-normal line-clamp-3">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        
                        <div className="p-3 border-t border-slate-50 bg-slate-50/20">
                            <Link
                                href={route('landlord.reminders.index')}
                                className="block w-full text-center py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                                onClick={() => setShowDropdown(false)}
                            >
                                Xem tất cả nhắc nhở
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
