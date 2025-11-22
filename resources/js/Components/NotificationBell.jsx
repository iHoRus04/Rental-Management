import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function NotificationBell() {
    const [pendingCount, setPendingCount] = useState(0);
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
            .then(data => setPendingCount(data.count))
            .catch(err => console.error('Error fetching reminders:', err));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                {/* Bell Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Badge */}
                {pendingCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Nhắc nhở</h3>
                                {pendingCount > 0 && (
                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                        {pendingCount} cần xử lý
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-4">
                            {pendingCount > 0 ? (
                                <p className="text-gray-700 mb-3">
                                    Bạn có {pendingCount} nhắc nhở cần xử lý
                                </p>
                            ) : (
                                <p className="text-gray-500 mb-3">
                                    Không có nhắc nhở mới
                                </p>
                            )}
                            
                            <Link
                                href={route('landlord.reminders.index')}
                                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
