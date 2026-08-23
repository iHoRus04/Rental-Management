import { Link, Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useMemo } from 'react';
import AlertModal from '@/Components/AlertModal';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ house, rooms, roomLimit, currentRoomCount }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canCreateRoom = isLandlord || userPerms.includes('rooms.create');
    const canEditRoom = isLandlord || userPerms.includes('rooms.edit');
    const canDeleteRoom = isLandlord || userPerms.includes('rooms.delete');
    const [viewMode, setViewMode] = useState('map');
    const [showLimitAlert, setShowLimitAlert] = useState(false);
    const [confirmDeleteRoom, setConfirmDeleteRoom] = useState({ show: false, roomId: null });

    const handleCreateClick = (e) => {
        if (currentRoomCount >= roomLimit) {
            e.preventDefault();
            setShowLimitAlert(true);
        }
    };

    // Group rooms by floor
    const roomsByFloor = useMemo(() => {
        const grouped = {};
        rooms.forEach((room) => {
            const floorKey = room.floor !== null && room.floor !== undefined ? `Tầng ${room.floor}` : 'Khác';
            if (!grouped[floorKey]) {
                grouped[floorKey] = [];
            }
            grouped[floorKey].push(room);
        });

        // Sort floors: highest floor first, push "Khác" to bottom
        return Object.keys(grouped)
            .sort((a, b) => {
                if (a === 'Khác') return 1;
                if (b === 'Khác') return -1;
                const numA = parseInt(a.replace('Tầng ', ''));
                const numB = parseInt(b.replace('Tầng ', ''));
                return numB - numA;
            })
            .reduce((obj, key) => {
                obj[key] = grouped[key].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
                return obj;
            }, {});
    }, [rooms]);

    // Format currency
    const formatVND = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

    return (
        <div className="min-h-screen bg-emerald-50/30 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans relative">
            <Head title={`Danh sách phòng - ${house.name}`} />
            
            {/* Background Blobs */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-400 opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 pb-4 sm:pb-6 border-b border-gray-100">
                    <div>
                        <div className="mb-2">
                            <Link
                                href={route('landlord.houses.index')}
                                className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách nhà trọ
                            </Link>
                        </div>
                        
                        <p className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Quản lý phòng trọ
                        </p>
                        <h1 className="text-xl sm:text-2xl font-black text-teal-900 tracking-tight">
                            {house.name}
                        </h1>
                        <p className="text-gray-400 mt-1 text-xs flex items-center gap-1 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate">{house.address}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
                        {/* View Mode Toggle Switch */}
                        <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all border-0 ${
                                    viewMode === 'map'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                }`}
                            >
                                Sơ đồ phòng
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all border-0 ${
                                    viewMode === 'list'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                }`}
                            >
                                Danh sách thẻ
                            </button>
                        </div>

                        {canCreateRoom && (
                            <Link
                                href={route('landlord.houses.rooms.create', house.id)}
                                onClick={handleCreateClick}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98] whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Thêm phòng
                            </Link>
                        )}
                    </div>
                </div>

                {/* --- EMPTY STATE --- */}
                {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-emerald-100">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-teal-900 mb-1">Chưa có phòng nào</h3>
                        <p className="text-gray-500 text-sm mb-6">Hãy tạo các phòng trọ để bắt đầu quản lý khách thuê.</p>
                        <Link
                            href={route('landlord.houses.rooms.create', house.id)}
                            onClick={handleCreateClick}
                            className="text-emerald-600 font-bold hover:underline"
                        >
                            + Thêm phòng ngay
                        </Link>
                    </div>
                ) : viewMode === 'map' ? (
                    /* --- VIEW 1: VISUAL ROOM MAP (GROUPED BY FLOOR) --- */
                    <div className="space-y-8">
                        {/* Room Status Legend Card */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-x-6 gap-y-3 justify-center sm:justify-start items-center text-xs font-bold text-slate-500">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Chú thích trạng thái:</span>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex-shrink-0"></span>
                                <span>Còn trống</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-lg bg-blue-50 border border-blue-200 flex-shrink-0"></span>
                                <span>Đã thuê (Bình thường)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-lg bg-amber-50 border border-amber-200 flex-shrink-0"></span>
                                <span>Sắp hết hạn hợp đồng (≤15 ngày)</span>
                            </div>
                            <div className="flex items-center gap-2 text-rose-600">
                                <span className="w-3.5 h-3.5 rounded-lg bg-rose-50 border border-rose-200 flex-shrink-0 animate-pulse"></span>
                                <span>Nợ tiền phòng/hóa đơn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0"></span>
                                <span>Đang bảo trì</span>
                            </div>
                        </div>

                        {/* Floor-by-floor container */}
                        <div className="space-y-6">
                            {Object.keys(roomsByFloor).map((floorName) => (
                                <div key={floorName} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[100px]">
                                    {/* Left: Floor Label Header */}
                                    <div className="md:w-32 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center p-4 shrink-0">
                                        <span className="font-extrabold text-teal-900 text-sm tracking-tight">{floorName}</span>
                                    </div>

                                    {/* Right: Room Grid Blocks */}
                                    <div className="flex-1 p-6 flex flex-wrap gap-4 items-center">
                                        {roomsByFloor[floorName].map((room) => {
                                            // Determine theme configuration based on status, unpaid bill, and contract expiration
                                            let bgClass = 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 border-emerald-150';
                                            let textDesc = 'Sẵn sàng cho thuê';
                                            let statusDot = 'bg-emerald-500';

                                            if (room.status === 'maintenance') {
                                                bgClass = 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 border-slate-200';
                                                textDesc = 'Đang bảo trì/Sửa chữa';
                                                statusDot = 'bg-slate-400';
                                            } else if (room.status === 'occupied') {
                                                if (room.has_unpaid_bills) {
                                                    bgClass = 'bg-rose-50/80 hover:bg-rose-50 text-rose-700 border-rose-200';
                                                    textDesc = `Hóa đơn chưa đóng (${room.renter_name})`;
                                                    statusDot = 'bg-rose-500';
                                                } else if (room.is_expiring_soon) {
                                                    bgClass = 'bg-amber-50/80 hover:bg-amber-50 text-amber-700 border-amber-200';
                                                    textDesc = `Hợp đồng sắp hết hạn (${room.renter_name})`;
                                                    statusDot = 'bg-amber-500';
                                                } else {
                                                    bgClass = 'bg-blue-50/80 hover:bg-blue-50 text-blue-700 border-blue-200';
                                                    textDesc = `Đang thuê (${room.renter_name})`;
                                                    statusDot = 'bg-blue-500';
                                                }
                                            }

                                            return (
                                                <Link
                                                    key={room.id}
                                                    href={route('landlord.houses.rooms.show', [house.id, room.id])}
                                                    className={`w-32 h-24 border rounded-2xl flex flex-col justify-between p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer relative group ${bgClass}`}
                                                >
                                                    {/* Room Name */}
                                                    <span className="font-extrabold text-sm tracking-tight">{room.name}</span>

                                                    {/* Specs & Info */}
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] opacity-75 font-semibold">{room.area ? `${room.area}m²` : ''}</span>
                                                        <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>
                                                    </div>

                                                    {/* Premium Hover Card details overlay */}
                                                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 bg-slate-900 text-white text-[10px] font-semibold py-2 px-3.5 rounded-xl shadow-xl z-20 whitespace-nowrap">
                                                        <p className="font-black text-emerald-400">{room.name} - {formatVND(room.price)}</p>
                                                        <p className="mt-1 text-slate-300 font-medium">{textDesc}</p>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-4 border-transparent border-b-slate-900"></div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* --- VIEW 2: ORIGINAL CARD GRID LISTING --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {rooms.map((room) => {
                            const roomImages = room.images ? JSON.parse(room.images) : [];
                            const firstImage = roomImages.length > 0 ? roomImages[0] : null;

                            const statusConfig = {
                                available: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Còn trống', dot: 'bg-emerald-500' },
                                occupied: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã thuê', dot: 'bg-blue-500' },
                                maintenance: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Bảo trì', dot: 'bg-amber-500' }
                            };
                            const status = statusConfig[room.status] || statusConfig.available;

                            return (
                                <div key={room.id} className="group bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-200 transition-all duration-300 flex flex-col">
                                    
                                    {/* Image area */}
                                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                                        {firstImage ? (
                                            <img
                                                src={`/storage/${firstImage}`}
                                                alt={room.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        
                                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm flex items-center gap-1.5 ${status.bg} ${status.text}`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></span>
                                            {status.label}
                                        </div>

                                        {roomImages.length > 1 && (
                                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {roomImages.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{room.name}</h3>
                                            <p className="text-emerald-600 font-extrabold text-lg">
                                                {formatVND(room.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
                                            {room.floor && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    Tầng {room.floor}
                                                </div>
                                            )}
                                            {room.area && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                                    {room.area} m²
                                                </div>
                                            )}
                                        </div>

                                        {room.description && (
                                            <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-grow">{room.description}</p>
                                        )}

                                        {/* Actions footer */}
                                        <div className="grid grid-cols-4 gap-2 mt-auto">
                                            <Link
                                                href={route('landlord.houses.rooms.show', [house.id, room.id])}
                                                className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Chi tiết
                                            </Link>
                                            
                                            <Link
                                                href={route('landlord.rooms.contracts.index', [room.id])}
                                                className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                Hợp đồng
                                            </Link>

                                            <Link
                                                href={route('landlord.rooms.services', room.id)}
                                                className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                                Dịch vụ
                                            </Link>

                                            {canDeleteRoom && (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteRoom({ show: true, roomId: room.id })}
                                                    className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <AlertModal
                show={showLimitAlert}
                onClose={() => setShowLimitAlert(false)}
                title="Đạt giới hạn phòng"
                message={`Không thể thêm phòng! Bạn đã đạt giới hạn tối đa của gói cước hiện hành (${roomLimit} phòng). Vui lòng nâng cấp hoặc gia hạn gói cước tại mục Gói Dịch Vụ để tạo thêm phòng!`}
                type="warning"
            />
            <ConfirmModal
                show={confirmDeleteRoom.show}
                onClose={() => setConfirmDeleteRoom({ show: false, roomId: null })}
                onConfirm={() => {
                    router.delete(route('landlord.houses.rooms.destroy', [house.id, confirmDeleteRoom.roomId]), {
                        onFinish: () => setConfirmDeleteRoom({ show: false, roomId: null }),
                    });
                }}
                title="Xóa phòng"
                message="Bạn có chắc muốn xóa phòng này không? Dữ liệu và hình ảnh sẽ bị xóa vĩnh viễn."
                confirmText="Xóa vĩnh viễn"
                type="danger"
            />
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;