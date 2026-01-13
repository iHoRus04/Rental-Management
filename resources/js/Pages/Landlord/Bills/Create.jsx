import { Link, useForm, usePage, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { contracts } = usePage().props;
    const [selectedContract, setSelectedContract] = useState(null);
    const [meterLog, setMeterLog] = useState(null);
    const [roomServices, setRoomServices] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        contract_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        room_price: '',
        electric_kwh: 0,
        electric_price: 0,
        water_usage: 0,
        water_price: 0,
        internet_cost: 0,
        trash_cost: 0,
        other_costs: 0,
        due_date: '',
        notes: '',
    });

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
            setRoomServices([]);
        }
    };

    const fetchRoomServices = async (roomId) => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/services`);
            if (response.ok) {
                const result = await response.json();
                setRoomServices(result.services || []);
            } else {
                setRoomServices([]);
            }
        } catch (error) {
            console.log('Không thể tải dịch vụ của phòng');
            setRoomServices([]);
        }
    };

    const fetchMeterLog = async (roomId) => {
        try {
            const response = await fetch(`/api/meter-logs/${roomId}/${data.month}/${data.year}`);
            if (response.ok) {
                const log = await response.json();
                setMeterLog(log);
                setData(prev => ({
                    ...prev,
                    electric_kwh: parseInt(log.electric_usage || 0),
                    water_usage: parseInt(log.water_usage || 0),
                }));
            } else {
                setMeterLog(null);
            }
        } catch (error) {
            console.log('Không có dữ liệu chỉ số');
            setMeterLog(null);
        }
    };

    const handleMonthYearChange = () => {
        if (selectedContract) {
            fetchMeterLog(selectedContract.room_id);
        }
    };

    const calculateElectricCost = () => (parseFloat(data.electric_kwh || 0) * parseFloat(data.electric_price || 0));
    const calculateWaterCost = () => (parseFloat(data.water_usage || 0) * parseFloat(data.water_price || 0));

    const calculateTotal = () => {
        return (
            parseFloat(data.room_price || 0) +
            calculateElectricCost() +
            calculateWaterCost() +
            parseFloat(data.internet_cost || 0) +
            parseFloat(data.trash_cost || 0) +
            parseFloat(data.other_costs || 0)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.bills.store'));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Tạo hóa đơn mới" />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.bills.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách hóa đơn
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </span>
                                Tạo hóa đơn mới
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Lập hóa đơn thu tiền phòng và dịch vụ hàng tháng.
                            </p>
                        </div>
                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Chọn Hợp đồng */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Chọn Khách hàng & Thời gian
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn hợp đồng <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.contract_id}
                                            onChange={handleContractChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                        >
                                            <option value="">-- Chọn phòng / khách thuê --</option>
                                            {contracts.map(contract => (
                                                <option key={contract.id} value={contract.id}>
                                                    Phòng {contract.room.name} - {contract.renterRequest?.name || 'N/A'}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {errors.contract_id && <p className="text-red-500 text-sm mt-1">{errors.contract_id}</p>}
                                </div>

                                {selectedContract && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 animate-fade-in">
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Thông tin hợp đồng</p>
                                            <p className="text-blue-900 font-medium">Phòng: <strong>{selectedContract.room.name}</strong></p>
                                            <p className="text-blue-900">Khách: {selectedContract.renterRequest?.name}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Giá thuê mặc định</p>
                                            <p className="text-xl font-bold text-blue-700">{(selectedContract.monthly_rent || 0).toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </div>
                                )}

                                {/* Room Services Info */}
                                {roomServices.length > 0 && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-fade-in">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Dịch vụ của phòng (Tham khảo)</p>
                                            <Link
                                                href={route('landlord.rooms.services', selectedContract.room_id)}
                                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                                                target="_blank"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {roomServices.map((service) => (
                                                <div key={service.id} className="bg-white rounded-lg p-3 border border-emerald-100">
                                                    <p className="text-xs text-gray-500 mb-1">{service.name}</p>
                                                    <p className="text-sm font-bold text-emerald-700">
                                                        {new Intl.NumberFormat('vi-VN').format(service.pivot.price)} ₫
                                                    </p>
                                                    {service.unit && (
                                                        <p className="text-[10px] text-gray-400">
                                                            {service.unit === 'kwh' && 'Đơn vị: kWh'}
                                                            {service.unit === 'm3' && 'Đơn vị: m³'}
                                                            {service.unit === 'month' && 'Theo tháng'}
                                                            {service.unit === 'service' && 'Dịch vụ'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-3 italic">💡 Bạn có thể tham khảo các mức giá này khi nhập dữ liệu bên dưới</p>
                                    </div>
                                )}

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

                        {/* Section 2: Chi tiết tiền */}
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
                                            {meterLog && <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.electric_usage}</p>}
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
                                            {meterLog && <p className="text-[10px] text-blue-600 mt-1 font-medium">📊 Đồng hồ: {meterLog.water_usage}</p>}
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

                                {/* Khác */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Internet</label>
                                        <input type="number" value={data.internet_cost} onChange={e => setData('internet_cost', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Rác & Vệ sinh</label>
                                        <input type="number" value={data.trash_cost} onChange={e => setData('trash_cost', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Khác</label>
                                        <input type="number" value={data.other_costs} onChange={e => setData('other_costs', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="0" />
                                    </div>
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