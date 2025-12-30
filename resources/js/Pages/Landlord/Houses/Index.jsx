import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { showToast } from '@/Components/Toast';

export default function Index({ houses }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Lọc dữ liệu giả lập (nếu cần xử lý client-side)
    const filteredHouses = houses.filter(house => 
        house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans">
            <Head title="Danh sách nhà trọ" />

            {/* --- HEADER SECTION (Giống mẫu: Title trái, Button phải) --- */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Nhà trọ</h1>
                    <p className="text-emerald-600/80 font-medium text-sm mt-1">Quản lý danh sách nhà trọ của bạn</p>
                </div>

                <div className="flex items-center gap-3">
                
                    
                    {/* Nút Filter (Giống mẫu) */}
                    <button className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Filter
                    </button>

                    {/* Nút Add Property (Gradient Emerald) */}
                    <Link
                        href={route('landlord.houses.create')}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Thêm nhà trọ
                    </Link>
                </div>
            </div>

            {/* --- GRID PROPERTIES (Giống layout ảnh mẫu) --- */}
            {filteredHouses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredHouses.map((house) => (
                        <div 
                            key={house.id} 
                            className="group bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
                        >
                            {/* 1. IMAGE AREA (Chiếm phần lớn phía trên) */}
                            <div className="relative h-64 overflow-hidden bg-gray-200">
                                {house.type && (
                                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                                        {house.type}
                                    </div>
                                )}
                                {house.image ? (
                                    <img 
                                        src={`/storage/${house.image}`} 
                                        alt={house.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <svg className="w-12 h-12 opacity-30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-xs font-medium opacity-50">No Image</span>
                                    </div>
                                )}

                                {/* Overlay Gradient (Chỉ hiện khi hover để giữ clean look) */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Quick Actions (Edit/Delete) - Nổi lên khi hover */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <Link
                                        href={route('landlord.houses.edit', house.id)}
                                        className="w-9 h-9 bg-white text-gray-600 rounded-full flex items-center justify-center hover:text-emerald-600 hover:shadow-md transition-all"
                                        title="Chỉnh sửa"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route('landlord.houses.destroy', house.id)}
                                        className="w-9 h-9 bg-white text-gray-600 rounded-full flex items-center justify-center hover:text-rose-500 hover:shadow-md transition-all"
                                        title="Xóa"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </Link>
                                </div>
                            </div>

                            {/* 2. CONTENT AREA (Thông tin bên dưới) */}
                            <Link href={route('landlord.houses.rooms.index', house.id)} className="p-5 block">
                                <div className="flex justify-between items-start mb-1">
                                    {/* Tên nhà (Trái) */}
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                                        {house.name}
                                    </h3>
                                    
                                    {/* Giá tiền/Trạng thái (Phải - Giống mẫu $1,500 Rent) */}
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-emerald-600 font-extrabold text-lg block">
                                            Manage
                                            <span className="text-xs text-gray-400 font-normal ml-1">→</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Địa chỉ (Subtitle - Giống mẫu Los Angeles, CA) */}
                                <p className="text-gray-500 text-sm mb-4 line-clamp-1 font-medium">
                                    {house.address}
                                </p>

                                {/* Footer nhỏ: Icon số lượng phòng hoặc thông tin phụ */}
                                <div className="flex items-center gap-4 border-t border-gray-100 pt-3 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <span>Click để xem phòng</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State đẹp mắt */
                <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-teal-900 mb-1">Chưa có bất động sản nào</h3>
                    <p className="text-gray-500 text-sm mb-6">Thêm bất động sản đầu tiên của bạn để bắt đầu quản lý.</p>
                    <Link
                        href={route('landlord.houses.create')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                    >
                        + Thêm bất động sản
                    </Link>
                </div>
            )}
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;