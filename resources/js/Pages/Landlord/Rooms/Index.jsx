import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ house, rooms }) {
    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans relative">
            <Head title={`Danh sách phòng - ${house.name}`} />
            
            {/* Background Blobs */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-400 opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <div className="mb-4">
                            <Link
                                href={route('landlord.houses.index')}
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách nhà trọ
                            </Link>
                        </div>
                        
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Quản lý phòng
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">
                            {house.name}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {house.address}
                        </p>
                    </div>

                    <Link
                        href={route('landlord.houses.rooms.create', house.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Thêm phòng mới
                    </Link>
                </div>

                {/* --- ROOM GRID --- */}
                {rooms.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-emerald-100">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-teal-900 mb-1">Chưa có phòng nào</h3>
                        <p className="text-gray-500 text-sm mb-6">Hãy tạo các phòng trọ để bắt đầu quản lý khách thuê.</p>
                        <Link
                            href={route('landlord.houses.rooms.create', house.id)}
                            className="text-emerald-600 font-bold hover:underline"
                        >
                            + Thêm phòng ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {rooms.map((room) => {
                            const roomImages = room.images ? JSON.parse(room.images) : [];
                            const firstImage = roomImages.length > 0 ? roomImages[0] : null;

                            // Cấu hình màu sắc cho trạng thái
                            const statusConfig = {
                                available: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Còn trống', dot: 'bg-emerald-500' },
                                occupied: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã thuê', dot: 'bg-blue-500' },
                                maintenance: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Bảo trì', dot: 'bg-amber-500' }
                            };
                            const status = statusConfig[room.status] || statusConfig.available;

                            return (
                                <div key={room.id} className="group bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-200 transition-all duration-300 flex flex-col">
                                    
                                    {/* 1. IMAGE AREA */}
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
                                        
                                        {/* Status Badge */}
                                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm flex items-center gap-1.5 ${status.bg} ${status.text}`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></span>
                                            {status.label}
                                        </div>

                                        {/* Image Count Badge */}
                                        {roomImages.length > 1 && (
                                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {roomImages.length}
                                            </div>
                                        )}
                                        
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* 2. CONTENT */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{room.name}</h3>
                                            <p className="text-emerald-600 font-extrabold text-lg">
                                                {new Intl.NumberFormat('vi-VN').format(room.price)} 
                                                <span className="text-xs text-gray-400 font-normal ml-1">₫/tháng</span>
                                            </p>
                                        </div>

                                        {/* Specs Row */}
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

                                        {/* 3. ACTIONS FOOTER */}
                                        <div className="grid grid-cols-3 gap-2 mt-auto">
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
                                                method='delete'
                                                as="button"
                                                href={route('landlord.houses.rooms.destroy', [house.id, room.id])}
                                                onClick={(e) => {
                                                    if (!confirm('Bạn có chắc muốn xóa phòng này không? Dữ liệu và hình ảnh sẽ bị xóa vĩnh viễn.')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Xóa
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;