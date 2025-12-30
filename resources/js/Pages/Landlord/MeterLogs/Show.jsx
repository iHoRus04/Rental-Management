import { Link, usePage, Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show() {
    const { meterLog, history } = usePage().props;
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        if (confirm('Bạn có chắc chắn muốn xóa chỉ số này không?')) {
            destroy(route('landlord.meter-logs.destroy', meterLog.id));
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Chỉ số phòng ${meterLog.room.name}`} />
            
            <div className="max-w-[1600px] mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.meter-logs.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl border border-teal-100">
                                {meterLog.room.name.replace(/[^0-9]/g, '') || '#'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight mb-1">
                                    Phòng {meterLog.room.name}
                                </h1>
                                <p className="text-gray-500 font-medium flex items-center gap-2">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm">
                                        Tháng {meterLog.month}/{meterLog.year}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="relative z-10 flex gap-3">
                            <Link
                                href={route('landlord.meter-logs.edit', meterLog.id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Chỉnh sửa
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Xóa
                            </button>
                        </div>

                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Current Log Details */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. Electric Log */}
                        <div className="bg-yellow-50/50 rounded-[24px] p-8 border border-yellow-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:scale-150 duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-yellow-800">Chỉ số Điện</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-sm font-bold text-yellow-600/70 uppercase tracking-wider mb-1">Chỉ số mới</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-extrabold text-yellow-900">{meterLog.electric_reading}</p>
                                            <span className="text-sm font-bold text-yellow-700">kWh</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-yellow-200 pl-8">
                                        <p className="text-sm font-bold text-yellow-600/70 uppercase tracking-wider mb-1">Sử dụng</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-extrabold text-yellow-600">+{meterLog.electric_usage || 0}</p>
                                            <span className="text-sm font-bold text-yellow-700">kWh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Water Log */}
                        <div className="bg-blue-50/50 rounded-[24px] p-8 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:scale-150 duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-blue-800">Chỉ số Nước</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-sm font-bold text-blue-600/70 uppercase tracking-wider mb-1">Chỉ số mới</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-extrabold text-blue-900">{meterLog.water_reading}</p>
                                            <span className="text-sm font-bold text-blue-700">m³</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-blue-200 pl-8">
                                        <p className="text-sm font-bold text-blue-600/70 uppercase tracking-wider mb-1">Sử dụng</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-extrabold text-blue-600">+{meterLog.water_usage || 0}</p>
                                            <span className="text-sm font-bold text-blue-700">m³</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Note */}
                        {meterLog.notes && (
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ghi chú</h3>
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200 italic">
                                    "{meterLog.notes}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: History Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                Lịch sử ghi nhận
                            </h2>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.map((log) => (
                                    <Link
                                        key={log.id}
                                        href={route('landlord.meter-logs.show', log.id)}
                                        className={`block p-4 rounded-xl border transition-all ${
                                            log.id === meterLog.id
                                                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`font-bold text-sm ${log.id === meterLog.id ? 'text-emerald-800' : 'text-gray-700'}`}>
                                                Tháng {log.month}/{log.year}
                                            </span>
                                            {log.id === meterLog.id && (
                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Đang xem</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                                {log.electric_usage || 0} kWh
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                {log.water_usage || 0} m³
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;