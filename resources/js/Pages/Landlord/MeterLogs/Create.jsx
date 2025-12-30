import { Link, useForm, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { rooms } = usePage().props;
    const [selectedRoom, setSelectedRoom] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        room_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electric_reading: '',
        water_reading: '',
        notes: '',
    });

    const handleRoomChange = (e) => {
        const roomId = e.target.value;
        setData('room_id', roomId);
        const room = rooms.find(r => r.id == roomId);
        setSelectedRoom(room);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.meter-logs.store'));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Ghi chỉ số Điện-Nước" />
            
            <div className="max-w-3xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.meter-logs.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Ghi chỉ số Điện-Nước
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Nhập chỉ số công tơ điện và đồng hồ nước hàng tháng.
                            </p>
                        </div>
                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Thông tin cơ bản */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Thông tin chung
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn phòng <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.room_id}
                                            onChange={handleRoomChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="">-- Chọn phòng --</option>
                                            {rooms.map(room => (
                                                <option key={room.id} value={room.id}>
                                                    {room.name}
                                                </option>
                                            ))}
                                        </select>
                                      
                                    </div>
                                    {errors.room_id && <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>}
                                </div>

                                {selectedRoom && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {selectedRoom.name.replace(/[^0-9]/g, '')}
                                        </div>
                                        <div>
                                            <p className="text-blue-900 font-bold">Phòng {selectedRoom.name}</p>
                                            <p className="text-blue-600 text-xs">Đang chọn</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tháng <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                value={data.month}
                                                onChange={e => setData('month', parseInt(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                                ))}
                                            </select>
                                            
                                        </div>
                                        {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Năm <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.year}
                                            onChange={e => setData('year', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        />
                                        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Nhập chỉ số */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Nhập chỉ số mới
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Điện */}
                                <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100 relative overflow-hidden group hover:border-yellow-300 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <svg className="w-24 h-24 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2 relative z-10">
                                        <span className="bg-yellow-200 p-1 rounded">⚡</span> 
                                        Chỉ số Điện (kWh) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.electric_reading}
                                        onChange={e => setData('electric_reading', parseInt(e.target.value) || '')}
                                        className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none font-bold text-gray-900 text-lg relative z-10 bg-white/80"
                                        placeholder="0"
                                    />
                                    {errors.electric_reading && <p className="text-red-500 text-sm mt-1 relative z-10">{errors.electric_reading}</p>}
                                </div>

                                {/* Nước */}
                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 relative overflow-hidden group hover:border-blue-300 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    </div>
                                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2 relative z-10">
                                        <span className="bg-blue-200 p-1 rounded">💧</span>
                                        Chỉ số Nước (m³) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.water_reading}
                                        onChange={e => setData('water_reading', parseInt(e.target.value) || '')}
                                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-bold text-gray-900 text-lg relative z-10 bg-white/80"
                                        placeholder="0"
                                    />
                                    {errors.water_reading && <p className="text-red-500 text-sm mt-1 relative z-10">{errors.water_reading}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú thêm</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none placeholder-gray-400"
                                    placeholder="Ghi chú về chỉ số (nếu có)..."
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.meter-logs.index')}
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
                                {processing ? 'Đang lưu...' : 'Lưu chỉ số'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;