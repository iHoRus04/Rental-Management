import { useState } from 'react';
import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const isoToVn = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoStr;
};

const vnToIso = (vnStr) => {
    if (!vnStr) return '';
    const cleanStr = vnStr.trim();
    const parts = cleanStr.includes('/') ? cleanStr.split('/') : cleanStr.split('-');
    if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return cleanStr;
};

export default function Edit() {
    const { room, contract, renterRequests } = usePage().props;

    // Format date to YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const initialStartIso = formatDateForInput(contract.start_date);
    const initialEndIso = formatDateForInput(contract.end_date);

    const [startDateVn, setStartDateVn] = useState(isoToVn(initialStartIso));
    const [endDateVn, setEndDateVn] = useState(isoToVn(initialEndIso));

    const { data, setData, put, processing, errors } = useForm({
        renter_request_id: contract.renter_request_id,
        start_date: initialStartIso,
        end_date: initialEndIso,
        monthly_rent: contract.monthly_rent,
        deposit: contract.deposit,
        payment_date: contract.payment_date,
        status: contract.status,
        terms: contract.terms,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('landlord.rooms.contracts.update', [room.id, contract.id]));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa hợp đồng - ${room.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Hủy bỏ và quay lại
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Chỉnh sửa hợp đồng
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Đang cập nhật thông tin cho phòng <span className="font-bold text-gray-900">{room.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Thông tin chính */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Thông tin chung
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Người thuê */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Người thuê <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={data.renter_request_id}
                                            onChange={e => setData('renter_request_id', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="">Chọn người thuê</option>
                                            {renterRequests.map(renterRequest => (
                                                <option key={renterRequest.id} value={renterRequest.id}>
                                                    {renterRequest.name} - {renterRequest.phone}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.renter_request_id && <p className="text-red-500 text-sm mt-1">{errors.renter_request_id}</p>}
                                </div>

                                {/* Trạng thái */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="active">🟢 Đang hiệu lực</option>
                                            <option value="terminated">🔴 Đã chấm dứt</option>
                                            <option value="expired">⚫ Hết hạn</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                </div>

                                {/* Thời hạn */}
                                <div className="col-span-2 grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Ngày bắt đầu <span className="text-xs font-normal text-emerald-600">(Nhập: Ngày/Tháng/Năm)</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                placeholder="DD/MM/YYYY (Ví dụ: 03/08/2026)"
                                                value={startDateVn}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setStartDateVn(val);
                                                    const iso = vnToIso(val);
                                                    if (iso && iso.length === 10) {
                                                        setData('start_date', iso);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (data.start_date) {
                                                        setStartDateVn(isoToVn(data.start_date));
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium pr-12"
                                            />
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={e => {
                                                    setData('start_date', e.target.value);
                                                    setStartDateVn(isoToVn(e.target.value));
                                                }}
                                                className="absolute right-3 w-6 h-6 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute right-3 pointer-events-none text-emerald-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Ngày kết thúc <span className="text-xs font-normal text-emerald-600">(Nhập: Ngày/Tháng/Năm)</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                placeholder="DD/MM/YYYY (Ví dụ: 03/08/2027)"
                                                value={endDateVn}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setEndDateVn(val);
                                                    const iso = vnToIso(val);
                                                    if (iso && iso.length === 10) {
                                                        setData('end_date', iso);
                                                    } else if (!val) {
                                                        setData('end_date', '');
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (data.end_date) {
                                                        setEndDateVn(isoToVn(data.end_date));
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium pr-12"
                                            />
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                onChange={e => {
                                                    setData('end_date', e.target.value);
                                                    setEndDateVn(isoToVn(e.target.value));
                                                }}
                                                className="absolute right-3 w-6 h-6 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute right-3 pointer-events-none text-emerald-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tài chính */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Thông tin tài chính
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Giá thuê (tháng)</label>
                                    <div className="relative">
                                        <input
                                        
                                            type="number" step="1"
                                            value={data.monthly_rent}
                                            onChange={e => setData('monthly_rent', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">đ</div>
                                    </div>
                                    {errors.monthly_rent && <p className="text-red-500 text-sm mt-1">{errors.monthly_rent}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tiền cọc</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="1"
                                            value={data.deposit}
                                            onChange={e => setData('deposit', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">đ</div>
                                    </div>
                                    {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày thanh toán</label>
                                    <div className="relative">
                                        <select
                                            value={data.payment_date}
                                            onChange={e => setData('payment_date', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Ngày {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.payment_date && <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Điều khoản */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">3</span>
                                Điều khoản hợp đồng
                            </h2>
                            <textarea
                                value={data.terms}
                                onChange={e => setData('terms', e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-mono text-sm leading-relaxed"
                                placeholder="Nhập các điều khoản hợp đồng tại đây..."
                            />
                            {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
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
                                {processing ? 'Đang lưu...' : 'Cập nhật Hợp đồng'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;