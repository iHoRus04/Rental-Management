import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // <--- Đảm bảo đã import
export default function Edit() {
    const { bill } = usePage().props;

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const { data, setData, put, processing, errors } = useForm({
        month: bill.month,
        year: bill.year,
        room_price: Math.floor(bill.room_price || 0),
        electric_kwh: bill.electric_kwh || 0,
        electric_price: Math.floor(bill.electric_price || 0),
        water_usage: bill.water_usage || 0,
        water_price: Math.floor(bill.water_price || 0),
        service_costs: Math.floor(bill.service_costs || 0),
        other_costs: Math.floor(bill.other_costs || 0),
        due_date: formatDateForInput(bill.due_date),
        notes: bill.notes || '',
    });

    const calculateElectricCost = () => (parseFloat(data.electric_kwh || 0) * parseFloat(data.electric_price || 0));
    const calculateWaterCost = () => (parseFloat(data.water_usage || 0) * parseFloat(data.water_price || 0));

    const calculateTotal = () => {
        return (
            parseFloat(data.room_price || 0) +
            calculateElectricCost() +
            calculateWaterCost() +
            parseFloat(data.service_costs || 0) +
            parseFloat(data.other_costs || 0)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.bills.update', bill.id));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa hóa đơn #${bill.id}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.bills.show', bill.id)}
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
                                Chỉnh sửa hóa đơn
                            </h1>
                            <div className="mt-2 pl-[52px] flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Phòng <strong>{bill.room.name}</strong></span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {bill.renter_request?.name || 'Không xác định'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Thông tin chung */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Thời gian & Hạn thanh toán
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tháng <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.month}
                                        onChange={e => setData('month', e.target.value)}
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
                                        onChange={e => setData('year', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                    />
                                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hạn chót <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={data.due_date}
                                        onChange={e => setData('due_date', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                    />
                                    {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Chi tiết dịch vụ */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Chi tiết dịch vụ
                            </h2>

                            <div className="space-y-6">
                                {/* Tiền phòng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tiền phòng (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={data.room_price}
                                        onChange={e => setData('room_price', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-900"
                                    />
                                    {errors.room_price && <p className="text-red-500 text-sm mt-1">{errors.room_price}</p>}
                                </div>

                                {/* Điện */}
                                <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100/80">
                                    <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                        <span className="bg-yellow-200 p-1 rounded">⚡</span> Tiền Điện
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Số kWh</label>
                                            <input type="number" value={data.electric_kwh} onChange={e => setData('electric_kwh', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Đơn giá</label>
                                            <input type="number" value={data.electric_price} onChange={e => setData('electric_price', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thành tiền</label>
                                            <div className="w-full px-3 py-2 rounded-lg bg-white border border-transparent text-yellow-800 font-bold text-sm text-right shadow-sm">
                                                {calculateElectricCost().toLocaleString('vi-VN')} ₫
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nước */}
                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100/80">
                                    <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                        <span className="bg-blue-200 p-1 rounded">💧</span> Tiền Nước
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Số khối (m³)</label>
                                            <input type="number" value={data.water_usage} onChange={e => setData('water_usage', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Đơn giá</label>
                                            <input type="number" value={data.water_price} onChange={e => setData('water_price', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thành tiền</label>
                                            <div className="w-full px-3 py-2 rounded-lg bg-white border border-transparent text-blue-800 font-bold text-sm text-right shadow-sm">
                                                {calculateWaterCost().toLocaleString('vi-VN')} ₫
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chi phí dịch vụ cố định (Tự động tính) */}
                                {data.service_costs > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-teal-800 mb-2">📋 Chi phí dịch vụ cố định (VNĐ)</label>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('vi-VN').format(data.service_costs) + " ₫"}
                                            readOnly
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 font-semibold outline-none cursor-not-allowed"
                                        />
                                    </div>
                                )}

                                {/* Chi phí khác */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">📝 Chi phí khác (VNĐ)</label>
                                    <input type="number" value={data.other_costs} onChange={e => setData('other_costs', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* Tổng cộng */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white flex justify-between items-center">
                            <span className="text-lg font-bold">Tổng cộng thanh toán</span>
                            <span className="text-3xl font-extrabold tracking-tight">{calculateTotal().toLocaleString('vi-VN')} ₫</span>
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú thêm</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                placeholder="Nhập ghi chú cho người thuê..."
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.bills.index')}
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
                                {processing ? 'Đang lưu...' : 'Lưu Hóa Đơn'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;