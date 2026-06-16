import { Link, useForm, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { contracts } = usePage().props;
    const [selectedContract, setSelectedContract] = useState(null);
    const [meterLog, setMeterLog]       = useState(null);
    const [roomServices, setRoomServices] = useState([]); // tất cả dịch vụ thô từ API

    // Dịch vụ phân loại
    const [fixedServices, setFixedServices]   = useState([]); // unit=month/service: { id, name, price, checked }
    const [electricPrice, setElectricPrice]   = useState(0);  // đơn giá điện từ dịch vụ
    const [waterPrice, setWaterPrice]         = useState(0);  // đơn giá nước từ dịch vụ

    const { data, setData, post, processing, errors } = useForm({
        contract_id:    '',
        month:          new Date().getMonth() + 1,
        year:           new Date().getFullYear(),
        room_price:     '',
        electric_kwh:   0,
        electric_price: 0,
        water_usage:    0,
        water_price:    0,
        internet_cost:  0,
        trash_cost:     0,
        other_costs:    0,
        due_date:       '',
        notes:          '',
    });

    /* ─── Chọn hợp đồng ─── */
    const handleContractChange = (e) => {
        const contractId = e.target.value;
        setData('contract_id', contractId);

        const contract = contracts.find(c => c.id == contractId);
        if (contract) {
            setSelectedContract(contract);
            setData('room_price', contract.monthly_rent);
            fetchMeterLog(contract.room_id);
            fetchRoomServices(contract.room_id);
        } else {
            setSelectedContract(null);
            setMeterLog(null);
            resetServices();
        }
    };

    const resetServices = () => {
        setRoomServices([]);
        setFixedServices([]);
        setElectricPrice(0);
        setWaterPrice(0);
    };

    /* ─── Fetch dịch vụ phòng ─── */
    const fetchRoomServices = async (roomId) => {
        try {
            const res = await fetch(`/api/rooms/${roomId}/services`);
            if (!res.ok) { resetServices(); return; }

            const result   = await res.json();
            const services = result.services || [];
            setRoomServices(services);

            const fixed = [];
            let elP = 0, wP = 0;

            services.forEach(s => {
                // Bỏ qua dịch vụ inactive trong pivot
                if (s.pivot?.is_active === false) return;

                const unit  = s.unit;
                const price = parseFloat(s.pivot?.price ?? s.default_price ?? 0);

                if (unit === 'kwh') {
                    elP = price;
                } else if (unit === 'm3') {
                    wP = price;
                } else {
                    // Tất cả loại khác (month, service, ...) → có thể toggle
                    fixed.push({ id: s.id, name: s.name, price, checked: true });
                }
            });

            setFixedServices(fixed);
            setElectricPrice(elP);
            setWaterPrice(wP);

            // Auto-fill đơn giá điện/nước và tổng dịch vụ tháng
            const serviceTotal = fixed.reduce((sum, s) => sum + s.price, 0);
            setData(prev => ({
                ...prev,
                electric_price: elP  || prev.electric_price,
                water_price:    wP   || prev.water_price,
                other_costs:    serviceTotal,
            }));
        } catch {
            resetServices();
        }
    };

    /* ─── Toggle từng dịch vụ ─── */
    const toggleService = (id) => {
        const updated = fixedServices.map(s =>
            s.id === id ? { ...s, checked: !s.checked } : s
        );
        setFixedServices(updated);

        // Cập nhật other_costs = tổng dịch vụ đang được chọn
        const total = updated.filter(s => s.checked).reduce((sum, s) => sum + s.price, 0);
        setData('other_costs', total);
    };

    /* ─── Fetch chỉ số điện nước ─── */
    const fetchMeterLog = async (roomId) => {
        try {
            const res = await fetch(`/api/meter-logs/${roomId}/${data.month}/${data.year}`);
            if (res.ok) {
                const log = await res.json();
                setMeterLog(log);
                setData(prev => ({
                    ...prev,
                    electric_kwh: parseInt(log.electric_usage || 0),
                    water_usage:  parseInt(log.water_usage || 0),
                }));
            } else {
                setMeterLog(null);
            }
        } catch {
            setMeterLog(null);
        }
    };

    const handleMonthYearChange = () => {
        if (selectedContract) fetchMeterLog(selectedContract.room_id);
    };

    /* ─── Tính toán ─── */
    const calcElectric = () => parseFloat(data.electric_kwh || 0) * parseFloat(data.electric_price || 0);
    const calcWater    = () => parseFloat(data.water_usage  || 0) * parseFloat(data.water_price    || 0);
    const calcTotal    = () =>
        parseFloat(data.room_price    || 0) +
        calcElectric() +
        calcWater()    +
        parseFloat(data.internet_cost || 0) +
        parseFloat(data.trash_cost    || 0) +
        parseFloat(data.other_costs   || 0);

    const fmt = (v) => parseFloat(v || 0).toLocaleString('vi-VN');

    // Dịch vụ đang được chọn
    const activeServices  = fixedServices.filter(s => s.checked);
    const servicesCost    = activeServices.reduce((sum, s) => sum + s.price, 0);
    // Chi phí khác ngoài dịch vụ
    const extraOther      = parseFloat(data.other_costs || 0) - servicesCost;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.bills.store'));
    };

    /* ══════════════════════════════════════════════ UI ══════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Tạo hóa đơn mới" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.bills.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại danh sách hóa đơn
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                Tạo hóa đơn mới
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">Lập hóa đơn thu tiền phòng và dịch vụ hàng tháng.</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* ── Section 1: Hợp đồng & thời gian ── */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Chọn Khách hàng & Thời gian
                            </h2>

                            <div className="space-y-6">
                                {/* Chọn hợp đồng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn hợp đồng <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.contract_id}
                                            onChange={handleContractChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="">-- Chọn phòng / khách thuê --</option>
                                            {contracts.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    Phòng {c.room.name} – {c.renterRequest?.name || 'N/A'}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.contract_id && <p className="text-red-500 text-sm mt-1">{errors.contract_id}</p>}
                                </div>

                                {/* Info hợp đồng */}
                                {selectedContract && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Thông tin hợp đồng</p>
                                            <p className="text-blue-900 font-medium">Phòng: <strong>{selectedContract.room.name}</strong></p>
                                            <p className="text-blue-900">Khách: {selectedContract.renterRequest?.name}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Giá thuê</p>
                                            <p className="text-xl font-bold text-blue-700">{(selectedContract.monthly_rent || 0).toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Dịch vụ phòng (có toggle) ── */}
                                {roomServices.length > 0 && (
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="text-sm font-bold text-gray-700">Dịch vụ của phòng</span>
                                            </div>
                                            {servicesCost > 0 && (
                                                <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-bold">
                                                    Đã chọn: +{fmt(servicesCost)} ₫
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-2">
                                            {/* Dịch vụ điện - chỉ hiển thị thông tin */}
                                            {electricPrice > 0 && (
                                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                                                    <span className="text-lg">⚡</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-amber-700">Đơn giá điện (tự động điền)</p>
                                                        <p className="text-sm text-amber-900 font-semibold">{electricPrice.toLocaleString('vi-VN')} ₫/kWh</p>
                                                    </div>
                                                    <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">AUTO</span>
                                                </div>
                                            )}

                                            {/* Dịch vụ nước - chỉ hiển thị thông tin */}
                                            {waterPrice > 0 && (
                                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                                                    <span className="text-lg">💧</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-blue-700">Đơn giá nước (tự động điền)</p>
                                                        <p className="text-sm text-blue-900 font-semibold">{waterPrice.toLocaleString('vi-VN')} ₫/m³</p>
                                                    </div>
                                                    <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">AUTO</span>
                                                </div>
                                            )}

                                            {/* Dịch vụ tháng — có thể bật/tắt */}
                                            {fixedServices.length > 0 && (
                                                <>
                                                    {electricPrice > 0 || waterPrice > 0 ? (
                                                        <div className="flex items-center gap-2 py-1">
                                                            <div className="flex-1 h-px bg-gray-100" />
                                                            <span className="text-[10px] text-gray-400 font-medium">Dịch vụ theo tháng</span>
                                                            <div className="flex-1 h-px bg-gray-100" />
                                                        </div>
                                                    ) : null}

                                                    {fixedServices.map((service) => (
                                                        <label
                                                            key={service.id}
                                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                                                                service.checked
                                                                    ? 'border-emerald-300 bg-emerald-50'
                                                                    : 'border-gray-100 bg-gray-50 opacity-60'
                                                            }`}
                                                        >
                                                            {/* Custom checkbox */}
                                                            <div
                                                                onClick={() => toggleService(service.id)}
                                                                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                                                                    service.checked
                                                                        ? 'bg-emerald-500 border-emerald-500'
                                                                        : 'border-gray-300 bg-white'
                                                                }`}
                                                            >
                                                                {service.checked && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            <div className="flex-1" onClick={() => toggleService(service.id)}>
                                                                <p className="text-sm font-semibold text-gray-800">📦 {service.name}</p>
                                                                <p className="text-xs text-gray-500">Phí cố định theo tháng</p>
                                                            </div>

                                                            <div className="text-right" onClick={() => toggleService(service.id)}>
                                                                <p className={`text-sm font-bold ${service.checked ? 'text-emerald-700' : 'text-gray-400 line-through'}`}>
                                                                    +{service.price.toLocaleString('vi-VN')} ₫
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </>
                                            )}

                                            {fixedServices.length === 0 && electricPrice === 0 && waterPrice === 0 && (
                                                <p className="text-center text-gray-400 text-sm py-2">Phòng này chưa có dịch vụ nào.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tháng / Năm / Hạn */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tháng <span className="text-red-500">*</span></label>
                                        <select
                                            value={data.month}
                                            onChange={(e) => { setData('month', e.target.value); handleMonthYearChange(); }}
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
                                            onChange={(e) => { setData('year', e.target.value); handleMonthYearChange(); }}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        />
                                        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hạn thanh toán</label>
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
                        </div>

                        {/* ── Section 2: Chi tiết tiền ── */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Chi tiết phí
                            </h2>

                            <div className="space-y-6">
                                {/* Tiền phòng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">🏠 Tiền phòng (VNĐ)</label>
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
                                            <input
                                                type="number" value={data.electric_kwh}
                                                onChange={e => setData('electric_kwh', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                                                placeholder="0"
                                            />
                                            {meterLog && <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.electric_usage}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Đơn giá</label>
                                            <input
                                                type="number" value={data.electric_price}
                                                onChange={e => setData('electric_price', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thành tiền</label>
                                            <div className="w-full px-3 py-2 rounded-lg bg-white border border-transparent text-yellow-800 font-bold text-sm text-right shadow-sm">
                                                {calcElectric().toLocaleString('vi-VN')} ₫
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
                                            <input
                                                type="number" value={data.water_usage}
                                                onChange={e => setData('water_usage', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                                placeholder="0"
                                            />
                                            {meterLog && <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.water_usage}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Đơn giá</label>
                                            <input
                                                type="number" value={data.water_price}
                                                onChange={e => setData('water_price', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thành tiền</label>
                                            <div className="w-full px-3 py-2 rounded-lg bg-white border border-transparent text-blue-800 font-bold text-sm text-right shadow-sm">
                                                {calcWater().toLocaleString('vi-VN')} ₫
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Internet / Rác / Khác */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">🌐 Internet</label>
                                        <input
                                            type="number" value={data.internet_cost}
                                            onChange={e => setData('internet_cost', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">🗑 Rác & Vệ sinh</label>
                                        <input
                                            type="number" value={data.trash_cost}
                                            onChange={e => setData('trash_cost', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">📝 Chi phí khác</label>
                                        <input
                                            type="number" value={data.other_costs}
                                            onChange={e => setData('other_costs', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="0"
                                        />
                                        {servicesCost > 0 && (
                                            <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                                                Gồm {fmt(servicesCost)} ₫ dịch vụ đã chọn
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Breakdown & Tổng cộng ── */}
                        <div className="bg-gradient-to-br from-teal-900 to-emerald-800 rounded-2xl p-6 shadow-lg text-white space-y-3">
                            <p className="text-sm font-bold text-emerald-200 uppercase tracking-wider">Chi tiết hóa đơn</p>

                            <div className="space-y-1.5 text-sm">
                                {parseFloat(data.room_price) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">🏠 Tiền phòng</span>
                                        <span className="font-semibold">{fmt(data.room_price)} ₫</span>
                                    </div>
                                )}
                                {calcElectric() > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">⚡ Tiền điện ({fmt(data.electric_kwh)} kWh × {fmt(data.electric_price)})</span>
                                        <span className="font-semibold">{fmt(calcElectric())} ₫</span>
                                    </div>
                                )}
                                {calcWater() > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">💧 Tiền nước ({fmt(data.water_usage)} m³ × {fmt(data.water_price)})</span>
                                        <span className="font-semibold">{fmt(calcWater())} ₫</span>
                                    </div>
                                )}
                                {parseFloat(data.internet_cost) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">🌐 Internet</span>
                                        <span className="font-semibold">{fmt(data.internet_cost)} ₫</span>
                                    </div>
                                )}
                                {parseFloat(data.trash_cost) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">🗑 Rác & Vệ sinh</span>
                                        <span className="font-semibold">{fmt(data.trash_cost)} ₫</span>
                                    </div>
                                )}
                                {/* Từng dịch vụ đã chọn */}
                                {activeServices.map((s, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-emerald-200">📦 {s.name}</span>
                                        <span className="font-semibold">{s.price.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                ))}
                                {/* Chi phí khác ngoài dịch vụ */}
                                {extraOther > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">📝 Chi phí khác</span>
                                        <span className="font-semibold">{fmt(extraOther)} ₫</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-emerald-600/50 pt-3 flex justify-between items-center">
                                <span className="text-base font-bold">Tổng cộng thanh toán</span>
                                <span className="text-3xl font-extrabold tracking-tight">{calcTotal().toLocaleString('vi-VN')} ₫</span>
                            </div>
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
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {processing ? 'Đang lưu...' : 'Tạo Hóa Đơn'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;