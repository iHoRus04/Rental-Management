import { Link, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { meterLogs, rooms } = usePage().props;
    const [filterRoom, setFilterRoom] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const filteredLogs = meterLogs.filter(log => {
        if (filterRoom && log.room_id != filterRoom) return false;
        if (filterMonth && log.month != filterMonth) return false;
        if (filterYear && log.year != filterYear) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Chỉ số Điện-Nước" />
            
            <div className="max-w-[1200px] mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Quản lý tiện ích
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Chỉ số Điện-Nước</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={filterRoom}
                            onChange={(e) => setFilterRoom(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        >
                            <option value="">Tất cả phòng</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <select
                            
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-6 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                            >
                                <option value="">Tháng</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>T{i + 1}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Năm"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-20 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                            />
                        </div>

                        {(filterRoom || filterMonth || filterYear) && (
                            <button
                                onClick={() => {
                                    setFilterRoom('');
                                    setFilterMonth('');
                                    setFilterYear('');
                                }}
                                className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                                title="Xóa bộ lọc"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}

                        <Link
                            href={route('landlord.meter-logs.create')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 ml-auto sm:ml-0 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Ghi chỉ số
                        </Link>
                    </div>
                </div>

                {/* --- HORIZONTAL LIST --- */}
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Chưa có dữ liệu.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div 
                                key={log.id} 
                                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-6"
                            >
                                {/* 1. Room Identity */}
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-100 shadow-sm">
                                        {log.room.name || '#'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                            {log.room.contract?.renter_request?.name || 'Chưa có người thuê'}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                             Tháng {log.month}/{log.year}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider for mobile */}
                                <div className="h-px bg-gray-100 w-full lg:hidden"></div>

                                {/* 2. Metrics Section (Middle) */}
                                <div className="flex-grow grid grid-cols-2 gap-4 lg:gap-8 lg:border-l lg:border-dashed lg:border-gray-200 lg:pl-8">
                                    {/* Electric */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Điện</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-gray-900 text-lg">{log.electric_reading}</span>
                                                <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                                                    +{log.electric_usage} kWh
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Water */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nước</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-gray-900 text-lg">{log.water_reading}</span>
                                                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                                    +{log.water_usage} m³
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Actions (Right) */}
                                <div className="flex items-center justify-end gap-2 lg:pl-6 lg:border-l lg:border-gray-100">
                                 
                                     <Link
                                            href={route('landlord.meter-logs.show', log.id || '#')}
                                            className="px-4 py-2 bg-white text-gray-700 text-sm font-bold rounded-xl border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2 group-hover:bg-emerald-50/50"
                                        >
                                            Chi tiết
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    
                                 
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;