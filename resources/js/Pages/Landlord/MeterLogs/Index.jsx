import { Link, usePage, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { houses = [], meterLogs = [], rooms = [] } = usePage().props;

    // State
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [electricPriceInput, setElectricPriceInput] = useState(0);
    const [waterPriceInput, setWaterPriceInput] = useState(0);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [roomSearch, setRoomSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, recorded, unrecorded

    const fmt = (v) => parseFloat(v || 0).toLocaleString('vi-VN');

    // Current month/year for house card counters
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Helper: calculate recorded status for a house card (for current month/year)
    const getRecordedStatus = (houseId) => {
        const houseRooms = rooms.filter(r => r.house_id === houseId);
        const totalRooms = houseRooms.length;

        const recordedCount = houseRooms.filter(room =>
            meterLogs.some(log => log.room_id === room.id && log.month === currentMonth && log.year === currentYear)
        ).length;

        return { recordedCount, totalRooms };
    };

    // Filtered rooms for selected house
    const houseRooms = selectedHouse
        ? rooms.filter(r => r.house_id === selectedHouse.id)
        : [];

    // Filter rooms based on search and selected month/year log status
    const filteredRooms = houseRooms.filter(room => {
        // Room search match
        const matchesSearch = room.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
            (room.contract?.renter_request?.name || '').toLowerCase().includes(roomSearch.toLowerCase());

        if (!matchesSearch) return false;

        // Log status match
        const logForPeriod = meterLogs.find(log => log.room_id === room.id && log.month === parseInt(filterMonth) && log.year === parseInt(filterYear));
        const isRecorded = !!logForPeriod;

        if (statusFilter === 'recorded' && !isRecorded) return false;
        if (statusFilter === 'unrecorded' && isRecorded) return false;

        return true;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Chỉ số Điện-Nước" />

            <div className="max-w-[1400px] mx-auto">

                {/* --- BACK & HOUSE DETAIL TITLE OR GENERAL TITLE --- */}
                {!selectedHouse ? (
                    <>
                        {/* HOUSE LIST VIEW HEADER */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Quản lý tiện ích
                                </p>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Chỉ số Điện-Nước</h1>
                                <p className="text-gray-500 mt-1 text-sm">Chọn nhà trọ/căn hộ để xem và chốt số điện nước hàng tháng</p>
                            </div>

                        </div>

                        {/* HOUSES GRID */}
                        {houses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Bạn chưa quản lý nhà nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {houses.map((house) => {
                                    const { recordedCount, totalRooms } = getRecordedStatus(house.id);
                                    const isComplete = totalRooms > 0 && recordedCount === totalRooms;

                                    return (
                                        <div
                                            key={house.id}
                                            onClick={() => setSelectedHouse(house)}
                                            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>

                                            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                                <div>
                                                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                                        {house.type === 'apartment' ? 'Chung cư' : house.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                                    </span>
                                                    <h3 className="text-xl font-extrabold text-teal-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                                        {house.name}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                                <span className="text-xs text-gray-400 font-bold uppercase">Phòng chốt số T{currentMonth}:</span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {recordedCount}/{totalRooms} phòng
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* ROOMS VIEW HEADER FOR SELECTED HOUSE */}
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setSelectedHouse(null);
                                    setRoomSearch('');
                                    setStatusFilter('all');
                                }}
                                className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors group"
                            >
                                <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách nhà
                            </button>

                            <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {selectedHouse.type === 'apartment' ? 'Chung cư' : selectedHouse.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-400 font-semibold">{houseRooms.length} phòng tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 mb-3">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 text-[11px] font-semibold text-amber-800">
                                                <span>⚡ Điện:</span>
                                                <span className="font-extrabold">{selectedHouse.electric_price > 0 ? `${fmt(selectedHouse.electric_price)} ₫/kWh` : 'Chưa thiết lập'}</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] font-semibold text-blue-800">
                                                <span>💧 Nước:</span>
                                                <span className="font-extrabold">{selectedHouse.water_price > 0 ? `${fmt(selectedHouse.water_price)} ₫/m³` : 'Chưa thiết lập'}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setElectricPriceInput(selectedHouse.electric_price || 0);
                                                    setWaterPriceInput(selectedHouse.water_price || 0);
                                                    setShowPriceModal(true);
                                                }}
                                                className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors border border-teal-100/50"
                                            >
                                                ⚙️ Thiết lập giá
                                            </button>
                                        </div>
                                    </div>

                                    {/* Month/Year selectors inside header */}
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full lg:w-auto justify-between lg:justify-start">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-gray-500 font-bold uppercase pl-2">Chọn Kỳ:</span>
                                            <select
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-gray-100 transition-colors"
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
                                                className="bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-700 w-16 text-center focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-gray-100 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROOM FILTERING & SEARCH CONTROLS */}
                        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Tabs */}
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-full md:w-auto">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all'
                                            ? 'bg-white text-emerald-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Tất cả ({houseRooms.length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('recorded')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === 'recorded'
                                            ? 'bg-white text-emerald-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Đã chốt số
                                </button>
                                <button
                                    onClick={() => setStatusFilter('unrecorded')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === 'unrecorded'
                                            ? 'bg-white text-emerald-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Chưa chốt số
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Tìm số phòng hoặc người thuê..."
                                    value={roomSearch}
                                    onChange={(e) => setRoomSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all shadow-none"
                                />
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* ROOMS LIST WITH CORRESPONDING METER LOG OF TARGET MONTH/YEAR */}
                        {filteredRooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Không tìm thấy phòng nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRooms.map((room) => {
                                    // Find log for chosen period
                                    const log = meterLogs.find(l => l.room_id === room.id && l.month === parseInt(filterMonth) && l.year === parseInt(filterYear));
                                    const hasLog = !!log;
                                    const renterName = room.contract?.renter_request?.name;

                                    return (
                                        <div
                                            key={room.id}
                                            className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px] ${hasLog ? 'border-emerald-100' : 'border-gray-200 bg-gray-50/20'
                                                }`}
                                        >
                                            {/* Top info */}
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-extrabold text-teal-900">
                                                            Phòng {room.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {renterName ? `👤 ${renterName}` : '❌ Phòng trống'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${hasLog ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {hasLog ? 'Đã ghi' : 'Chưa ghi'}
                                                    </span>
                                                </div>

                                                {/* Divider */}
                                                <div className="h-px bg-gray-100 w-full my-3"></div>

                                                {/* Metrics */}
                                                {hasLog ? (
                                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                                        <div className="p-2 bg-yellow-50/50 rounded-xl border border-yellow-100 flex items-center gap-2">
                                                            <span className="text-sm">⚡</span>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 font-bold uppercase">Điện</span>
                                                                <span className="font-extrabold text-gray-800 text-sm">{log.electric_reading}</span>
                                                                <span className="text-[10px] text-yellow-700 bg-yellow-100 rounded px-1 ml-1 font-bold">+{log.electric_usage}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-2 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                                                            <span className="text-sm">💧</span>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 font-bold uppercase">Nước</span>
                                                                <span className="font-extrabold text-gray-800 text-sm">{log.water_reading}</span>
                                                                <span className="text-[10px] text-blue-700 bg-blue-100 rounded px-1 ml-1 font-bold">+{log.water_usage}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-5 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
                                                        <p className="text-xs text-gray-400 font-medium">Chưa có chỉ số tháng {filterMonth}/{filterYear}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-auto pt-3">
                                                {hasLog ? (
                                                    <>
                                                        <Link
                                                            href={route('landlord.meter-logs.show', log.id)}
                                                            className="flex-1 py-2 bg-emerald-50 text-emerald-700 text-center rounded-xl text-xs font-bold hover:bg-emerald-100 border border-emerald-100/50 transition-colors"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                        <Link
                                                            href={route('landlord.meter-logs.edit', log.id)}
                                                            className="px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                                                            title="Chỉnh sửa"
                                                        >
                                                            ✏️
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={`${route('landlord.meter-logs.create')}?room_id=${room.id}&month=${filterMonth}&year=${filterYear}`}
                                                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-center rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                                    >
                                                        + Ghi chỉ số mới
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal thiết lập giá điện nước */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-xl max-w-md w-full border border-gray-100 p-6 relative overflow-hidden">
                        <h3 className="text-xl font-extrabold text-teal-900 mb-2 flex items-center gap-2">
                            <span>⚙️</span> Thiết lập đơn giá điện nước
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Áp dụng đơn giá cố định cho tất cả các phòng thuộc nhà <strong>{selectedHouse.name}</strong> khi lập hóa đơn.
                        </p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">⚡ Đơn giá điện (₫ / kWh)</label>
                                <input
                                    type="number"
                                    value={electricPriceInput}
                                    onChange={e => setElectricPriceInput(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-800"
                                    placeholder="e.g. 3500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💧 Đơn giá nước (₫ / m³)</label>
                                <input
                                    type="number"
                                    value={waterPriceInput}
                                    onChange={e => setWaterPriceInput(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-800"
                                    placeholder="e.g. 15000"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    router.put(route('landlord.houses.update-utility-prices', selectedHouse.id), {
                                        electric_price: electricPriceInput,
                                        water_price: waterPriceInput,
                                    }, {
                                        onSuccess: (page) => {
                                            setShowPriceModal(false);
                                            const updatedHouse = page.props.houses.find(h => h.id === selectedHouse.id);
                                            if (updatedHouse) {
                                                setSelectedHouse(updatedHouse);
                                            }
                                        }
                                    });
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;