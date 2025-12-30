import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateRenterRequest({ auth, rooms }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        room_id: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.renter-requests.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tạo yêu cầu thuê phòng</h2>}
        >
            <Head title="Tạo yêu cầu thuê phòng" />

            <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-3xl mx-auto">
                    {/* --- HEADER --- */}
                    <div className="mb-8">
                        <Link 
                            href={route('landlord.renter-requests.index')} 
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Quay lại danh sách
                        </Link>

                        <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                    <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </span>
                                    Tạo yêu cầu thuê
                                </h1>
                                <p className="text-gray-500 mt-2 pl-[52px]">
                                    Nhập thông tin khách hàng tiềm năng muốn thuê phòng.
                                </p>
                            </div>
                            {/* Decor blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            
                            {/* Section 1: Thông tin phòng & Người thuê */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                    Thông tin cơ bản
                                </h2>

                                <div className="space-y-6">
                                    {/* Chọn phòng */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Chọn phòng quan tâm</label>
                                        <div className="relative">
                                            <select
                                                value={data.room_id}
                                                onChange={e => setData('room_id', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                            >
                                                <option value="">-- Chọn phòng --</option>
                                                {rooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.house.name} - {room.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.room_id && <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>}
                                    </div>

                                    {/* Họ tên */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="Nhập họ tên khách hàng..."
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Liên hệ */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                                placeholder="09..."
                                                required
                                            />
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                                placeholder="example@mail.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Tin nhắn */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                    Nội dung
                                </h2>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tin nhắn / Ghi chú</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                                        placeholder="Nhập ghi chú thêm hoặc yêu cầu đặc biệt..."
                                    />
                                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                                <Link
                                    href={route('landlord.renter-requests.index')}
                                    className="px-6 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Hủy bỏ
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    )}
                                    {processing ? 'Đang lưu...' : 'Tạo Yêu Cầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}