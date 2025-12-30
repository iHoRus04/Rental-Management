import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function RenterRequestShow({ auth, renterRequest }) {
    const { props } = usePage();
    const csrfToken = props?.csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Check if renterRequest data exists
    if (!renterRequest) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chi tiết yêu cầu thuê phòng</h2>}
            >
                <Head title="Chi tiết yêu cầu thuê phòng" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 text-center">
                                <p className="text-gray-500">Không tìm thấy thông tin yêu cầu.</p>
                                <Link href={route('landlord.renter-requests.index')} className="text-blue-600 hover:underline mt-4 inline-block">Quay lại danh sách</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const getStatusConfig = (status) => {
        const config = {
            new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Mới', icon: '✨', dot: 'bg-blue-500' },
            contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Đã liên hệ', icon: '📞', dot: 'bg-yellow-500' },
            approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã duyệt', icon: '✅', dot: 'bg-emerald-500' },
            rejected: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Đã từ chối', icon: '❌', dot: 'bg-rose-500' },
        };
        return config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: '❔', dot: 'bg-gray-500' };
    };

    const statusConfig = getStatusConfig(renterRequest.status);

    const updateStatus = (status) => {
        if (confirm(`Bạn có chắc chắn muốn chuyển trạng thái thành "${getStatusConfig(status).label}"?`)) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('landlord.renter-requests.update-status', [renterRequest.id, status]);
            form.innerHTML = `<input type="hidden" name="_token" value="${csrfToken}">`;
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Yêu cầu #${renterRequest.id}`} />

            <div className="max-w-5xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link 
                        href={route('landlord.renter-requests.index')} 
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Yêu cầu thuê</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusConfig.bg} ${statusConfig.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">
                                {renterRequest.name || 'Khách vãng lai'}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Gửi lúc: {renterRequest.created_at ? new Date(renterRequest.created_at).toLocaleString('vi-VN') : 'N/A'}
                            </p>
                        </div>
                        
                        {/* Status Actions */}
                        <div className="flex gap-3 relative z-10">
                            {renterRequest.status !== 'approved' && (
                                <button
                                    onClick={() => updateStatus('approved')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Duyệt yêu cầu
                                </button>
                            )}
                            {renterRequest.status !== 'rejected' && (
                                <button
                                    onClick={() => updateStatus('rejected')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:border-rose-200 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Từ chối
                                </button>
                            )}
                        </div>

                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: User Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* 1. Thông tin liên hệ */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                                Thông tin liên hệ
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Số điện thoại</p>
                                    {renterRequest.phone ? (
                                        <a href={`tel:${renterRequest.phone}`} className="text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                                            {renterRequest.phone}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </a>
                                    ) : <span className="text-gray-400 italic">Chưa cung cấp</span>}
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email</p>
                                    {renterRequest.email ? (
                                        <a href={`mailto:${renterRequest.email}`} className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors flex items-center gap-2 truncate">
                                            {renterRequest.email}
                                        </a>
                                    ) : <span className="text-gray-400 italic">Chưa cung cấp</span>}
                                </div>
                            </div>

                            {renterRequest.message && (
                                <div className="mt-6">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Lời nhắn</p>
                                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-900 text-sm leading-relaxed italic">
                                        "{renterRequest.message}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Room Info */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
                                Phòng quan tâm
                            </h2>

                            {renterRequest.room ? (
                                <div className="flex-grow flex flex-col">
                                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs text-purple-500 font-bold uppercase mb-1">Tên phòng</p>
                                                <h3 className="text-xl font-bold text-purple-900">{renterRequest.room.name}</h3>
                                            </div>
                                            {renterRequest.room.price && (
                                                <div className="text-right">
                                                    <p className="text-xs text-purple-500 font-bold uppercase mb-1">Giá thuê</p>
                                                    <p className="text-lg font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(renterRequest.room.price)} ₫</p>
                                                </div>
                                            )}
                                        </div>
                                        {renterRequest.room.house && (
                                            <div className="mt-2 pt-2 border-t border-purple-200/50">
                                                <p className="text-xs text-purple-400 font-bold uppercase mb-1">Nhà trọ</p>
                                                <p className="text-sm font-medium text-gray-700 truncate">{renterRequest.room.house.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <Link 
                                            href={route('landlord.houses.rooms.show', [renterRequest.room.house_id, renterRequest.room.id])}
                                            className="block w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-center font-bold rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all text-sm"
                                        >
                                            Xem chi tiết phòng
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-400 py-8">
                                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-sm">Không có thông tin phòng cụ thể</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

RenterRequestShow.layout = (page) => <AuthenticatedLayout children={page} />;