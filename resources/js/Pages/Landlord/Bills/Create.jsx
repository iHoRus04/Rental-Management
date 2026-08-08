import { Link, useForm, usePage, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AlertModal from '@/Components/AlertModal';

export default function Create() {
    const { contracts = [], houses = [] } = usePage().props;
    const [selectedContract, setSelectedContract] = useState(null);
    const [meterLog, setMeterLog] = useState(null);
    const [roomServices, setRoomServices] = useState([]); // tất cả dịch vụ thô từ API

    // Bank setup states
    const [showBankSetupModal, setShowBankSetupModal] = useState(false);
    const [bankNameInput, setBankNameInput] = useState('');
    const [accountNoInput, setAccountNoInput] = useState('');
    const [accountNameInput, setAccountNameInput] = useState('');
    const [savingBank, setSavingBank] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: 'Thông báo', message: '', type: 'warning' });

    const VIETNAM_BANKS = [
        { code: 'vietcombank', name: 'Vietcombank' },
        { code: 'techcombank', name: 'Techcombank' },
        { code: 'mbbank', name: 'MB Bank' },
        { code: 'bidv', name: 'BIDV' },
        { code: 'vietinbank', name: 'VietinBank' },
        { code: 'agribank', name: 'Agribank' },
        { code: 'vpbank', name: 'VPBank' },
        { code: 'acb', name: 'ACB' },
        { code: 'sacombank', name: 'Sacombank' },
        { code: 'tpbank', name: 'TPBank' },
        { code: 'shb', name: 'SHB' },
        { code: 'ocb', name: 'OCB' },
    ];

    // Dịch vụ phân loại
    const [fixedServices, setFixedServices] = useState([]); // unit=month/service: { id, name, price, checked }
    const [electricPrice, setElectricPrice] = useState(0);  // đơn giá điện từ dịch vụ
    const [waterPrice, setWaterPrice] = useState(0);  // đơn giá nước từ dịch vụ

    const { data, setData, post, processing, errors } = useForm({
        contract_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        room_price: '',
        electric_kwh: 0,
        electric_price: 0,
        water_usage: 0,
        water_price: 0,
        service_costs: 0,
        other_costs: 0,
        due_date: '',
        notes: '',
    });

    const [selectedHouseId, setSelectedHouseId] = useState('');

    // Lấy danh sách Nhà trọ trực tiếp từ tất cả các nhà trọ mà Nhân viên/Chủ trọ có quyền truy cập
    const housesList = houses.length > 0 ? houses : Array.from(
        new Map(
            contracts
                .map(c => c.room?.house)
                .filter(Boolean)
                .map(h => [h.id, h])
        ).values()
    );

    // Lọc danh sách hợp đồng theo Nhà trọ được chọn
    const filteredContracts = selectedHouseId
        ? contracts.filter(c => c.room?.house?.id == selectedHouseId)
        : contracts;

    /* ─── Chọn hợp đồng ─── */
    const handleContractChange = (e) => {
        const contractId = e.target.value;
        setData('contract_id', contractId);

        const contract = contracts.find(c => c.id == contractId);
        if (contract) {
            setSelectedContract(contract);
            setData('room_price', contract.monthly_rent);

            const houseElectricPrice = parseFloat(contract.room?.house?.electric_price || 0);
            const houseWaterPrice = parseFloat(contract.room?.house?.water_price || 0);

            fetchMeterLog(contract.room_id, data.month, data.year);
            fetchRoomServices(contract.room_id, houseElectricPrice, houseWaterPrice);
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
    const fetchRoomServices = async (roomId, houseElectricPrice = 0, houseWaterPrice = 0) => {
        try {
            const res = await fetch(`/api/rooms/${roomId}/services`);
            if (!res.ok) { resetServices(); return; }

            const result = await res.json();
            const services = result.services || [];
            setRoomServices(services);

            const fixed = [];
            let elP = houseElectricPrice || 0;
            let wP = houseWaterPrice || 0;

            services.forEach(s => {
                // Bỏ qua dịch vụ inactive trong pivot
                if (s.pivot?.is_active === false) return;

                const unit = s.unit;
                const price = parseFloat(s.pivot?.price ?? s.default_price ?? 0);

                if (unit === 'kwh') {
                    if (!elP) elP = price;
                } else if (unit === 'm3') {
                    if (!wP) wP = price;
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
                electric_price: elP || prev.electric_price,
                water_price: wP || prev.water_price,
                service_costs: serviceTotal,
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

        // Cập nhật service_costs = tổng dịch vụ đang được chọn
        const total = updated.filter(s => s.checked).reduce((sum, s) => sum + s.price, 0);
        setData('service_costs', total);
    };

    /* ─── Fetch chỉ số điện nước ─── */
    const fetchMeterLog = async (roomId, targetMonth = data.month, targetYear = data.year) => {
        try {
            const res = await fetch(`/api/meter-logs/${roomId}/${targetMonth}/${targetYear}`);
            if (res.ok) {
                const log = await res.json();
                setMeterLog(log);
                setData(prev => ({
                    ...prev,
                    electric_kwh: parseInt(log.electric_usage || 0),
                    water_usage: parseInt(log.water_usage || 0),
                }));
            } else {
                setMeterLog(null);
                setData(prev => ({
                    ...prev,
                    electric_kwh: 0,
                    water_usage: 0,
                }));
            }
        } catch {
            setMeterLog(null);
            setData(prev => ({
                ...prev,
                electric_kwh: 0,
                water_usage: 0,
            }));
        }
    };

    /* ─── Tính toán ─── */
    const calcElectric = () => parseFloat(data.electric_kwh || 0) * parseFloat(data.electric_price || 0);
    const calcWater = () => parseFloat(data.water_usage || 0) * parseFloat(data.water_price || 0);
    const calcTotal = () =>
        parseFloat(data.room_price || 0) +
        calcElectric() +
        calcWater() +
        parseFloat(data.service_costs || 0) +
        parseFloat(data.other_costs || 0);

    const fmt = (v) => parseFloat(v || 0).toLocaleString('vi-VN');

    // Dịch vụ đang được chọn
    const activeServices = fixedServices.filter(s => s.checked);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedContract) {
            const house = selectedContract.room?.house;
            const isBankMissing = !house?.bank_name || !house?.account_no || !house?.account_name;
            if (isBankMissing) {
                setBankNameInput(house?.bank_name || '');
                setAccountNoInput(house?.account_no || '');
                setAccountNameInput(house?.account_name || '');
                setShowBankSetupModal(true);
                return;
            }
        }

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
                                {/* Chọn nhà trọ (Bộ lọc nâng cao) */}
                                {housesList.length > 1 && (
                                    <div>
                                        <label className="block text-sm font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                                            <span>🏢</span> Chọn Nhà trọ / Căn hộ <span className="text-xs text-gray-400 font-normal">(Lọc danh sách)</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedHouseId}
                                                onChange={(e) => {
                                                    setSelectedHouseId(e.target.value);
                                                    // Reset hợp đồng đã chọn khi đổi nhà trọ
                                                    setData('contract_id', '');
                                                    setSelectedContract(null);
                                                    setMeterLog(null);
                                                    resetServices();
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-teal-900 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Tất cả nhà trọ ({contracts.length} phòng đang thuê) --</option>
                                                {housesList.map(h => {
                                                    const count = contracts.filter(c => c.room?.house?.id == h.id).length;
                                                    return (
                                                        <option key={h.id} value={h.id}>
                                                            {h.name} ({count} phòng)
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-emerald-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Chọn hợp đồng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn phòng / khách thuê <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.contract_id}
                                            onChange={handleContractChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none font-semibold text-gray-800"
                                        >
                                            <option value="">-- Chọn phòng / khách thuê ({filteredContracts.length}) --</option>
                                            {filteredContracts.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    [{c.room?.house?.name || 'Nhà trọ'}] Phòng {c.room.name} – {c.renterRequest?.name || 'N/A'}
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

                                {/* Cảnh báo chưa thiết lập tài khoản nhận tiền */}
                                {selectedContract && (!selectedContract.room?.house?.bank_name || !selectedContract.room?.house?.account_no || !selectedContract.room?.house?.account_name) && (
                                    <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 text-rose-800 mt-4 shadow-sm">
                                        <span className="text-2xl">🚨</span>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">Yêu cầu thiết lập Tài khoản thanh toán</h4>
                                            <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                                                Nhà trọ <strong>{selectedContract.room?.house?.name}</strong> chưa được cấu hình tài khoản ngân hàng (VietQR).
                                                Bạn phải thiết lập tài khoản nhận tiền trước khi có thể lập hóa đơn cho khách thuê để tự động hóa VietQR.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const h = selectedContract.room.house;
                                                    setBankNameInput(h.bank_name || '');
                                                    setAccountNoInput(h.account_no || '');
                                                    setAccountNameInput(h.account_name || '');
                                                    setShowBankSetupModal(true);
                                                }}
                                                className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/10 active:scale-95"
                                            >
                                                ⚙️ Thiết lập tài khoản ngay
                                            </button>
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
                                            {data.service_costs > 0 && (
                                                <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-bold">
                                                    Đã chọn: +{fmt(data.service_costs)} ₫
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-2">

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
                                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all select-none ${service.checked
                                                                ? 'border-emerald-300 bg-emerald-50'
                                                                : 'border-gray-100 bg-gray-50 opacity-60'
                                                                }`}
                                                        >
                                                            {/* Custom checkbox */}
                                                            <div
                                                                onClick={() => toggleService(service.id)}
                                                                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${service.checked
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
                                            onChange={(e) => {
                                                const m = parseInt(e.target.value);
                                                setData('month', m);
                                                if (selectedContract) fetchMeterLog(selectedContract.room_id, m, data.year);
                                            }}
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
                                            onChange={(e) => {
                                                const y = parseInt(e.target.value) || new Date().getFullYear();
                                                setData('year', y);
                                                if (selectedContract) fetchMeterLog(selectedContract.room_id, data.month, y);
                                            }}
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
                                {/* Cảnh báo chưa nhập điện nước */}
                                {!meterLog && selectedContract && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
                                        <span className="text-xl">⚠️</span>
                                        <div>
                                            <h4 className="font-bold text-sm">Chưa nhập điện nước</h4>
                                            <p className="text-xs text-rose-600 mt-0.5">
                                                Hệ thống không tìm thấy chỉ số điện nước cho Tháng {data.month}/{data.year}.
                                                Vui lòng đi đến trang quản lý chỉ số để ghi số trước, hoặc bạn có thể tự nhập thủ công số kWh điện và số khối nước dưới đây.
                                            </p>
                                        </div>
                                    </div>
                                )}

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
                                            {meterLog ? (
                                                <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.electric_usage} kWh</p>
                                            ) : (
                                                selectedContract && <p className="text-[10px] text-rose-500 mt-1 font-bold">⚠️ Chưa nhập điện nước</p>
                                            )}
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
                                            {meterLog ? (
                                                <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.water_usage} m³</p>
                                            ) : (
                                                selectedContract && <p className="text-[10px] text-rose-500 mt-1 font-bold">⚠️ Chưa nhập điện nước</p>
                                            )}
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

                                {/* Chi phí dịch vụ cố định (Tự động tính) */}
                                {data.service_costs > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-teal-800 mb-2">📋 Chi phí dịch vụ cố định (VNĐ)</label>
                                        <input
                                            type="text"
                                            value={fmt(data.service_costs) + " ₫"}
                                            readOnly
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 font-semibold outline-none cursor-not-allowed"
                                        />
                                    </div>
                                )}

                                {/* Chi phí khác */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">📝 Chi phí khác (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={data.other_costs}
                                        onChange={e => setData('other_costs', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        placeholder="0"
                                    />
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

                                {/* Từng dịch vụ đã chọn */}
                                {activeServices.map((s, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-emerald-200">📦 {s.name}</span>
                                        <span className="font-semibold">{s.price.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                ))}
                                {/* Chi phí khác */}
                                {parseFloat(data.other_costs) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-200">📝 Chi phí khác</span>
                                        <span className="font-semibold">{fmt(data.other_costs)} ₫</span>
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
                            {(() => {
                                const house = selectedContract?.room?.house;
                                const isBankMissing = selectedContract && (!house?.bank_name || !house?.account_no || !house?.account_name);
                                return (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isBankMissing
                                            ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-red-500/20'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30'
                                            }`}
                                    >
                                        {processing && (
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        )}
                                        {processing ? 'Đang lưu...' : isBankMissing ? '⚠️ Cần cấu hình tài khoản' : 'Tạo Hóa Đơn'}
                                    </button>
                                );
                            })()}
                        </div>
                    </form>
                </div>
                {/* Modal Thiết lập tài khoản ngân hàng nhanh */}
                {showBankSetupModal && selectedContract && (
                    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[24px] shadow-xl max-w-md w-full border border-gray-100 p-6 relative overflow-hidden">
                            <h3 className="text-lg font-extrabold text-teal-900 mb-2 flex items-center gap-2">
                                <span>⚙️</span> Thiết lập tài khoản VietQR
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Cấu hình tài khoản ngân hàng nhận tiền cho nhà trọ <strong>{selectedContract.room?.house?.name}</strong>.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ngân hàng</label>
                                    <select
                                        value={bankNameInput}
                                        onChange={e => setBankNameInput(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-700 text-xs cursor-pointer bg-white"
                                    >
                                        <option value="">-- Chọn ngân hàng nhận tiền --</option>
                                        {VIETNAM_BANKS.map(bank => (
                                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Số tài khoản</label>
                                    <input
                                        type="text"
                                        value={accountNoInput}
                                        onChange={e => setAccountNoInput(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-850 text-xs"
                                        placeholder="Số tài khoản ngân hàng"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tên chủ tài khoản</label>
                                    <input
                                        type="text"
                                        value={accountNameInput}
                                        onChange={e => setAccountNameInput(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-850 text-xs"
                                        placeholder="VIET GIAY HOA HOAC IN HOA"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowBankSetupModal(false)}
                                    disabled={savingBank}
                                    className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => {
                                        if (!bankNameInput || !accountNoInput || !accountNameInput) {
                                            setAlertModal({ show: true, title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng!', type: 'warning' });
                                            return;
                                        }
                                        setSavingBank(true);
                                        router.put(route('landlord.houses.update-utility-prices', selectedContract.room.house.id), {
                                            electric_price: selectedContract.room.house.electric_price || 0,
                                            water_price: selectedContract.room.house.water_price || 0,
                                            bank_name: bankNameInput,
                                            account_no: accountNoInput,
                                            account_name: accountNameInput,
                                        }, {
                                            onSuccess: (page) => {
                                                setSavingBank(false);
                                                setShowBankSetupModal(false);
                                                // Update details locally so the UI updates
                                                const house = selectedContract.room.house;
                                                house.bank_name = bankNameInput;
                                                house.account_no = accountNoInput;
                                                house.account_name = accountNameInput;
                                            },
                                            onError: () => {
                                                setSavingBank(false);
                                            }
                                        });
                                    }}
                                    disabled={savingBank}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    {savingBank ? 'Đang lưu...' : 'Lưu tài khoản'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                <AlertModal
                    show={alertModal.show}
                    onClose={() => setAlertModal({ ...alertModal, show: false })}
                    title={alertModal.title}
                    message={alertModal.message}
                    type={alertModal.type}
                />
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;