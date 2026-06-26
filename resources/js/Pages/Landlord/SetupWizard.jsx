import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function SetupWizard({ auth, services = [] }) {
    const [step, setStep] = useState(1);

    // Initialize services state with default prices
    const initialServices = services.map(svc => ({
        service_id: svc.id,
        name: svc.name,
        unit: svc.unit,
        price: svc.default_price,
        selected: svc.name === 'Tiền điện' || svc.name === 'Tiền nước' || svc.name === 'Internet', // auto select electric, water, internet
    }));

    const { data, setData, post, processing, errors } = useForm({
        house_name: '',
        house_address: '',
        room_count: 5,
        room_rent_price: 2500000,
        room_area: 25,
        services: initialServices,
    });

    const getUnitLabel = (unit) => {
        const unitMap = {
            kwh: 'kWh (Chỉ số)',
            m3: 'm³ (Chỉ số)',
            month: 'Tháng (Cố định)',
            service: 'Lần dùng',
        };
        return unitMap[unit] || unit;
    };

    const handleServiceToggle = (index) => {
        const updated = [...data.services];
        updated[index].selected = !updated[index].selected;
        setData('services', updated);
    };

    const handleServicePriceChange = (index, value) => {
        const updated = [...data.services];
        updated[index].price = value;
        setData('services', updated);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!data.house_name.trim() || !data.house_address.trim()) {
                alert('Vui lòng điền đầy đủ tên và địa chỉ nhà trọ.');
                return;
            }
        }
        if (step === 2) {
            if (data.room_count < 1 || data.room_count > 50) {
                alert('Số lượng phòng khởi tạo ban đầu phải từ 1 đến 50 phòng.');
                return;
            }
            if (data.room_rent_price <= 0) {
                alert('Vui lòng nhập giá thuê phòng hợp lệ.');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Filter only selected services for submission
        const selected = data.services
            .filter(svc => svc.selected)
            .map(svc => ({
                service_id: svc.service_id,
                price: svc.price,
            }));

        // Send submission
        post(route('landlord.setup-wizard.save'), {
            data: {
                ...data,
                services: selected
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            <Head title="Thiết lập nhanh chuỗi nhà trọ" />

            {/* Background Blob items */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-400 opacity-[0.1] rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-teal-400 opacity-[0.1] rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-emerald-950/5 overflow-hidden z-10">
                {/* Header branding */}
                <div className="p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h1 style={{ color: '#0D9488' }} className="text-2xl font-extrabold tracking-tight">Chào mừng đến với DreamHouses</h1>
                        <p style={{ color: '#94A3B8' }} className="text-xs mt-1 font-medium">Bắt đầu thiết lập chuỗi nhà trọ đầu tiên của bạn chỉ trong 3 bước ngắn</p>
                    </div>
                </div>

                {/* Progress bar steps */}
                <div className="px-8 pt-6 pb-2 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>1</span>
                        <span className={`text-xs font-bold ${step >= 1 ? 'text-teal-900' : 'text-gray-400'}`}>Tòa nhà</span>
                    </div>
                    <div className="flex-1 h-0.5 mx-4 bg-gray-100 relative">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>2</span>
                        <span className={`text-xs font-bold ${step >= 2 ? 'text-teal-900' : 'text-gray-400'}`}>Sơ đồ phòng</span>
                    </div>
                    <div className="flex-1 h-0.5 mx-4 bg-gray-100 relative">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300" style={{ width: step === 3 ? '100%' : '0%' }}></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>3</span>
                        <span className={`text-xs font-bold ${step >= 3 ? 'text-teal-900' : 'text-gray-400'}`}>Biểu giá dịch vụ</span>
                    </div>
                </div>

                {/* Form content steps */}
                <div className="p-8 bg-white/50">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* STEP 1: HOUSE DATA */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 1: Số hóa Tòa nhà</h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Khai báo thông tin chi nhánh/tòa nhà đầu tiên của bạn</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên tòa nhà / Nhà trọ <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.house_name}
                                        onChange={(e) => setData('house_name', e.target.value)}
                                        placeholder="Ví dụ: DreamHouse Quận 7, Nhà trọ Bình Thạnh..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all bg-white"
                                        required
                                    />
                                    {errors.house_name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.house_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.house_address}
                                        onChange={(e) => setData('house_address', e.target.value)}
                                        placeholder="Ví dụ: 123 Nguyễn Thị Thập, P. Tân Hưng, Q. 7, TP. HCM"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all bg-white"
                                        required
                                    />
                                    {errors.house_address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.house_address}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ROOM BULK GENERATOR */}
                        {step === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 2: Tạo nhanh sơ đồ phòng</h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Khởi tạo nhanh danh sách phòng trống với các thông số chuẩn</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng phòng trống khởi tạo <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.room_count}
                                            onChange={(e) => setData('room_count', parseInt(e.target.value) || 0)}
                                            min="1"
                                            max="50"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Hệ thống sẽ tự động tạo các phòng mang tên Phòng 101, Phòng 102...</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Diện tích phòng trung bình (m²)</label>
                                        <input
                                            type="number"
                                            value={data.room_area}
                                            onChange={(e) => setData('room_area', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Giá thuê cơ bản hàng tháng (VND) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={data.room_rent_price}
                                        onChange={(e) => setData('room_rent_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                                        required
                                    />
                                    {errors.room_rent_price && <p className="text-xs text-red-500 mt-1 font-medium">{errors.room_rent_price}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: METER PRICE CONFIGURATION */}
                        {step === 3 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 3: Biểu giá dịch vụ</h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Tích chọn các dịch vụ sẽ kinh doanh và điều chỉnh giá mặc định cho phòng</p>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-2xl p-4 bg-white space-y-3">
                                    {data.services.map((svc, index) => (
                                        <div key={svc.service_id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${svc.selected ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100 bg-gray-50/30'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={svc.selected}
                                                    onChange={() => handleServiceToggle(index)}
                                                    className="w-4.5 h-4.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-teal-950 block">{svc.name}</span>
                                                    <span className="text-[10px] text-gray-400">Đơn vị: {getUnitLabel(svc.unit)}</span>
                                                </div>
                                            </div>

                                            {svc.selected && (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        value={svc.price}
                                                        onChange={(e) => handleServicePriceChange(index, parseFloat(e.target.value) || 0)}
                                                        className="w-24 px-2 py-1 text-xs border border-gray-300 rounded-lg text-right focus:ring-1 focus:ring-emerald-500 focus:border-transparent font-extrabold text-teal-950"
                                                    />
                                                    <span className="text-[10px] text-gray-400 font-bold">đ</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100/50">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
                                >
                                    Quay lại
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/15 hover:shadow-emerald-700/20 transition-all"
                                >
                                    Tiếp theo
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/15 hover:shadow-emerald-700/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                            Đang hoàn tất...
                                        </>
                                    ) : 'Hoàn tất & Kích hoạt chuỗi'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
