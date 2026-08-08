import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AlertModal from '@/Components/AlertModal';

export default function SetupWizard({ auth, packages = [] }) {
    const [step, setStep] = useState(1);
    const [isPaid, setIsPaid] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Thông báo', type: 'warning' });

    const { data, setData, post, processing, errors } = useForm({
        package_id: packages.length > 0 ? packages[0].id : '',
        house_name: '',
        house_address: '',
        room_count: 5,
        room_rent_price: 2500000,
        room_area: 25,
    });

    const selectedPackage = packages.find(pkg => pkg.id === data.package_id) || { room_limit: 5, name: 'Free Trial', price: 0 };

    const { systemSettings } = usePage().props;
    const adminBank = systemSettings?.bank_name || 'vietinbank';
    const adminAccountNo = systemSettings?.account_no || '10287382718';
    const adminAccountName = systemSettings?.account_name || 'CONG TY DREAMHOUSES';

    const subDescription = `DH SETUP ${auth.user.email}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, "");
    
    const qrUrl = `https://img.vietqr.io/image/${adminBank}-${adminAccountNo}-compact2.png?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(subDescription)}&accountName=${encodeURIComponent(adminAccountName)}`;

    const handlePackageSelect = (pkg) => {
        setData(prev => {
            const nextRoomCount = prev.room_count > pkg.room_limit ? pkg.room_limit : prev.room_count;
            return {
                ...prev,
                package_id: pkg.id,
                room_count: nextRoomCount
            };
        });
        setIsPaid(false);
    };

    const confirmPayment = () => {
        setCheckingPayment(true);
        setTimeout(() => {
            setCheckingPayment(false);
            setIsPaid(true);
            // Automatically close modal and transition to step 2 after 1s on success
            setTimeout(() => {
                setShowPaymentModal(false);
                setStep(2);
            }, 1000);
        }, 1500); // Simulating banking gate checking in 1.5s
    };

    const nextStep = () => {
        if (step === 1) {
            if (!data.package_id) {
                setAlertModal({ show: true, title: 'Thiếu thông tin', message: 'Vui lòng chọn một gói dịch vụ để tiếp tục.', type: 'warning' });
                return;
            }
            const isFree = selectedPackage.price === 0 || parseFloat(selectedPackage.price) === 0;
            if (isFree) {
                setIsPaid(true);
                setStep(2); // Free package goes directly to step 2
            } else {
                if (isPaid) {
                    setStep(2); // If already paid, go to step 2
                } else {
                    setShowPaymentModal(true); // Otherwise trigger payment modal
                }
            }
            return;
        }
        if (step === 2) {
            if (!data.house_name.trim() || !data.house_address.trim()) {
                setAlertModal({ show: true, title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ tên và địa chỉ nhà trọ.', type: 'warning' });
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Validation
        const limit = selectedPackage.room_limit;
        if (data.room_count < 1 || data.room_count > limit) {
            setAlertModal({ show: true, title: 'Số lượng không hợp lệ', message: `Số lượng phòng khởi tạo ban đầu phải từ 1 đến ${limit} phòng (Theo hạn mức gói đã chọn).`, type: 'warning' });
            return;
        }
        if (data.room_rent_price <= 0) {
            setAlertModal({ show: true, title: 'Giá thuê không hợp lệ', message: 'Vui lòng nhập giá thuê phòng hợp lệ.', type: 'warning' });
            return;
        }

        // Send submission
        post(route('landlord.setup-wizard.save'), {
            data: data
        });
    };

    // Format currency VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
                        <h1 className="text-2xl font-extrabold tracking-tight">Chào mừng đến với DreamHouses</h1>
                        <p className="text-xs mt-1 font-medium">Bắt đầu thiết lập chuỗi nhà trọ đầu tiên của bạn chỉ trong 3 bước ngắn</p>
                    </div>
                </div>

                {/* Progress bar steps */}
                <div className="px-8 pt-6 pb-2 border-b border-gray-100/50 flex justify-between items-center bg-white/50 overflow-x-auto gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>1</span>
                        <span className={`text-xs font-bold ${step >= 1 ? 'text-teal-900' : 'text-gray-400'}`}>Gói dịch vụ</span>
                    </div>
                    <div className="flex-1 h-0.5 min-w-[30px] bg-gray-100 relative">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>2</span>
                        <span className={`text-xs font-bold ${step >= 2 ? 'text-teal-900' : 'text-gray-400'}`}>Tòa nhà</span>
                    </div>
                    <div className="flex-1 h-0.5 min-w-[30px] bg-gray-100 relative">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300" style={{ width: step >= 3 ? '100%' : '0%' }}></div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>3</span>
                        <span className={`text-xs font-bold ${step >= 3 ? 'text-teal-900' : 'text-gray-400'}`}>Sơ đồ phòng</span>
                    </div>
                </div>

                {/* Form content steps */}
                <div className="p-8 bg-white/50">
                    <div className="space-y-6">

                        {/* STEP 1: CHOOSE SUBSCRIPTION PACKAGE */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 1: Chọn gói dịch vụ</h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Chọn phiên bản cước phù hợp với quy mô hoạt động và tiến hành thanh toán</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-1">
                                    {packages.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">Không có gói dịch vụ nào đang được mở bán.</p>
                                    ) : (
                                        packages.map((pkg) => {
                                            const isSelected = data.package_id === pkg.id;
                                            return (
                                                <div
                                                    key={pkg.id}
                                                    onClick={() => !isPaid && handlePackageSelect(pkg)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isPaid
                                                        ? (isSelected
                                                            ? 'border-emerald-500 bg-emerald-50/10 cursor-not-allowed'
                                                            : 'border-gray-100 bg-gray-50/50 text-gray-400 cursor-not-allowed opacity-50')
                                                        : (isSelected
                                                            ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/5 cursor-pointer'
                                                            : 'border-gray-100 bg-white hover:border-gray-200 cursor-pointer')
                                                        }`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-teal-950 text-sm">{pkg.name}</span>
                                                            {isSelected && (
                                                                <span className="bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                                                                    Đang chọn
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                                                            Hạn mức: {pkg.room_limit === 9999 ? 'Không giới hạn' : `${pkg.room_limit} phòng`}
                                                        </span>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="block text-base font-black text-emerald-600">{formatVND(pkg.price)}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                            {pkg.duration_type === 'lifetime' 
                                                                ? 'Không giới hạn' 
                                                                : (pkg.duration_type === 'onetime' 
                                                                    ? `Dùng thử ${pkg.duration_value} ngày` 
                                                                    : `${pkg.duration_value || pkg.duration_months} ${pkg.duration_type === 'week' ? 'tuần' : pkg.duration_type === 'year' ? 'năm' : 'tháng'}`)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {isPaid && (
                                    <div className="mt-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold text-xs animate-fade-in">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        Gói cước đã thanh toán thành công! Bạn có thể bấm "Tiếp theo" để tiếp tục.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: HOUSE DATA */}
                        {step === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 2: Số hóa Tòa nhà</h3>
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

                        {/* STEP 3: ROOM BULK GENERATOR */}
                        {step === 3 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="border-b border-gray-100 pb-3 mb-4">
                                    <h3 className="text-lg font-extrabold text-teal-900">Bước 3: Tạo nhanh sơ đồ phòng</h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Khởi tạo nhanh danh sách phòng trống với các thông số chuẩn và hoàn tất</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-gray-700">Số lượng phòng trống khởi tạo <span className="text-red-500">*</span></label>

                                        </div>
                                        <input
                                            type="number"
                                            value={data.room_count}
                                            onChange={(e) => setData('room_count', parseInt(e.target.value) || 0)}
                                            min="1"
                                            max={selectedPackage.room_limit}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Hệ thống sẽ tự động tạo các phòng mang tên Phòng 101, Phòng 102...</p>
                                        {errors.room_count && <p className="text-xs text-red-500 mt-1 font-medium">{errors.room_count}</p>}
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
                                    type="button"
                                    onClick={handleSubmit}
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
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL (POP-UP OVERLAY) */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-teal-50 relative space-y-5 animate-scale-up">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => !checkingPayment && setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            disabled={checkingPayment}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="text-center pb-2 border-b border-slate-100">
                            <h4 className="font-extrabold text-teal-900 text-base">Thanh toán cước dịch vụ</h4>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Hóa đơn giả lập - Test nhanh</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {/* QR Code */}
                            <div className="w-40 h-40 bg-white border border-teal-100 rounded-2xl p-1.5 flex flex-col items-center justify-center relative overflow-hidden shadow-sm shrink-0">
                                <img
                                    src={qrUrl}
                                    alt="VietQR Chuyển khoản"
                                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-all duration-200"
                                    onClick={() => setShowZoomModal(true)}
                                    title="Bấm để phóng to và tải về"
                                />
                                {isPaid && (
                                    <div className="absolute inset-0 bg-emerald-500/95 backdrop-blur-xs flex items-center justify-center text-white">
                                        <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="w-full text-xs space-y-2 text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span>Gói dịch vụ:</span>
                                    <strong className="text-slate-800 font-bold">{selectedPackage.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Số tiền cước:</span>
                                    <strong className="text-emerald-600 font-black text-sm">{formatVND(selectedPackage.price)}</strong>
                                </div>
                                <div className="h-px bg-slate-200/50 my-1"></div>
                                <div className="flex justify-between">
                                    <span>Ngân hàng nhận:</span>
                                    <strong className="text-slate-800 font-bold uppercase">{adminBank}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Số tài khoản:</span>
                                    <strong className="text-slate-800 font-bold">{adminAccountNo}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Nội dung CK:</span>
                                    <strong className="text-teal-700 font-bold select-all">{subDescription}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Buttons inside Modal */}
                        <div>
                            {isPaid ? (
                                <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Xác nhận thanh toán thành công!
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={confirmPayment}
                                    disabled={checkingPayment}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-75 flex items-center justify-center gap-2"
                                >
                                    {checkingPayment ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                            Đang xác thực giao dịch test...
                                        </>
                                    ) : (
                                        'Tôi đã chuyển khoản (Xác nhận)'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox phóng to QR */}
            {showZoomModal && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 flex flex-col items-center shadow-2xl border border-slate-100/10 animate-scale-up">
                        <button
                            onClick={() => setShowZoomModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 transition-colors"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                            Quét mã thanh toán gói cước
                        </h3>
                        
                        <div className="w-72 h-72 bg-white rounded-2xl border border-slate-100 p-2 flex items-center justify-center shadow-inner-sm overflow-hidden mb-6">
                            <img
                                src={qrUrl}
                                alt="VietQR code enlarged"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(qrUrl);
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = `vietqr-setup-wizard.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl);
                                    } catch (e) {
                                        window.open(qrUrl, '_blank');
                                    }
                                }}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                            >
                                📥 Tải ảnh mã QR
                            </button>
                            <button
                                onClick={() => setShowZoomModal(false)}
                                className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-800 font-bold rounded-xl text-xs transition-all active:scale-95"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Modal Animations */}
            <style>{`
                @keyframes scale-up {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-up {
                    animation: scale-up 0.2s ease-out forwards;
                }
            `}</style>

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
