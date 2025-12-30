import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit() {
    const { meterLog, rooms } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        room_id: meterLog.room_id,
        month: meterLog.month,
        year: meterLog.year,
        electric_reading: meterLog.electric_reading,
        water_reading: meterLog.water_reading,
        notes: meterLog.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.meter-logs.update', meterLog.id));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa chỉ số phòng ${meterLog.room.name}`} />
            
            <div className="max-w-3xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.meter-logs.show', meterLog.id)}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Hủy và quay lại
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Chỉnh sửa chỉ số
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Cập nhật chỉ số điện nước cho <span className="font-bold text-gray-700">Phòng {meterLog.room.name}</span> - Tháng {meterLog.month}/{meterLog.year}
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phòng <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.room_id}
                                            onChange={e => setData('room_id', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            {rooms.map(room => (
                                                <option key={room.id} value={room.id}>{room.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.room_id && <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tháng <span className="text-red-500">*</span></label>
                                        <select
                                            value={data.month}
                                            onChange={e => setData('month', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                            ))}
                                        </select>
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

                        {/* Section 2: Chỉ số */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Cập nhật chỉ số
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Điện */}
                                <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                                    <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Chỉ số Điện (kWh) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.electric_reading}
                                        onChange={e => setData('electric_reading', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none font-bold text-gray-900 text-lg"
                                    />
                                    {errors.electric_reading && <p className="text-red-500 text-sm mt-1">{errors.electric_reading}</p>}
                                </div>

                                {/* Nước */}
                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        Chỉ số Nước (m³) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.water_reading}
                                        onChange={e => setData('water_reading', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-bold text-gray-900 text-lg"
                                    />
                                    {errors.water_reading && <p className="text-red-500 text-sm mt-1">{errors.water_reading}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                                    placeholder="Ghi chú thêm..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.meter-logs.show', meterLog.id)}
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
                                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;