import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, currentSubscription, roomCount, roomLimit, packages, history }) {
    const { systemSettings } = usePage().props;
    const { post, processing } = useForm();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [showZoomModal, setShowZoomModal] = useState(false);

    const adminBank = systemSettings?.bank_name || 'vietinbank';
    const adminAccountNo = systemSettings?.account_no || '10287382718';
    const adminAccountName = systemSettings?.account_name || 'CONG TY DREAMHOUSES';
    
    const subDescription = selectedPkg ? `DH SUB ${auth.user.email} PKG${selectedPkg.id}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, "") : '';

    const qrUrl = selectedPkg ? `https://img.vietqr.io/image/${adminBank}-${adminAccountNo}-compact2.png?amount=${selectedPkg.price}&addInfo=${encodeURIComponent(subDescription)}&accountName=${encodeURIComponent(adminAccountName)}` : '';

    const handleSubscribeClick = (pkg) => {
        setSelectedPkg(pkg);
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        if (!selectedPkg) return;
        setCheckingPayment(true);
        setTimeout(() => {
            setCheckingPayment(false);
            setShowPaymentModal(false);
            
            // Gửi request thực tế lên backend
            post(route('landlord.subscription.subscribe'), {
                data: { package_id: selectedPkg.id },
            });
        }, 1500); // Giả lập kiểm tra giao dịch chuyển khoản trong 1.5s
    };

    // Format currency VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Tính phần trăm sử dụng phòng
    const roomUsagePercent = Math.min(100, Math.round((roomCount / roomLimit) * 100));

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans space-y-10">
            <Head title="Quản lý Gói dịch vụ phần mềm" />

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Gói dịch vụ phần mềm</h1>
                <p className="text-gray-500 text-sm mt-1">Quản lý phiên bản bản quyền, giới hạn phòng hoạt động và gia hạn/nâng cấp gói phần mềm của bạn</p>
            </div>

            {/* CURRENT SUBSCRIPTION STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel 1 & 2: Thông tin gói hiện tại & giới hạn phòng */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                    Gói hiện hành
                                </span>
                                <h2 className="text-2xl font-black text-teal-950">
                                    {currentSubscription ? currentSubscription.package_name : 'Gói Trải nghiệm (Dùng thử)'}
                                </h2>
                            </div>
                            
                            <div className="text-right">
                                {currentSubscription ? (
                                    <>
                                        <span className="block text-2xl font-black text-emerald-600">{currentSubscription.days_left}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày còn lại</span>
                                    </>
                                ) : (
                                    <span className="text-amber-500 font-bold text-xs uppercase bg-amber-50 px-3 py-1.5 rounded-xl block">
                                        Chưa đăng ký gói
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                             <div>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Thời hạn sử dụng</span>
                                <span className="text-sm font-bold text-gray-700 mt-1 block">
                                    {currentSubscription ? `${currentSubscription.start_date.split(' ')[0]} đến ${currentSubscription.end_date.split(' ')[0]}` : 'Không thời hạn'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Chi phí đã trả</span>
                                <span className="text-sm font-bold text-gray-700 mt-1 block">
                                    {currentSubscription ? formatVND(currentSubscription.price) : '0 ₫'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-8 border-t border-gray-50 space-y-3 relative z-10">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                            <span>Sử dụng phòng ({roomCount}/{roomLimit} phòng)</span>
                            <span>{roomUsagePercent}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                style={{ width: `${roomUsagePercent}%` }}
                                className={`h-full rounded-full transition-all ${
                                    roomUsagePercent >= 90 ? 'bg-rose-500' : roomUsagePercent >= 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            * Khi đạt giới hạn phòng tối đa, bạn không thể tạo thêm phòng mới trừ khi nâng cấp gói dịch vụ cao hơn.
                        </p>
                    </div>
                </div>

                {/* Panel 3: Tại sao nên mua gói? */}
                <div className="bg-gradient-to-br from-teal-800 to-emerald-950 text-white rounded-3xl p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-700/20 rounded-full blur-2xl -mr-16 -mb-16 pointer-events-none"></div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Nâng cấp để Mở rộng quy mô</h3>
                        <p className="text-teal-100/80 text-xs leading-relaxed">
                            Mở rộng không giới hạn số lượng tòa nhà và phòng trọ để vận hành chuỗi dịch vụ.
                        </p>
                        <ul className="space-y-2.5 text-[11px] text-teal-50/90 font-medium">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Vận hành hàng trăm phòng trọ dễ dàng
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Hỗ trợ kỹ thuật 24/7 từ platform
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Xuất hóa đơn, quản lý sự cố nâng cao
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6 text-center text-[10px] text-teal-200/60 font-bold uppercase tracking-wider">
                        DreamHouses Premium Ecosystem
                    </div>
                </div>
            </div>

            {/* SUBSCRIPTION PACKAGES FOR PURCHASE */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-teal-900">Danh sách Gói dịch vụ mở bán</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                        const isCurrent = currentSubscription && currentSubscription.package_id === pkg.id;
                        const isUpgrade = currentSubscription && !isCurrent && pkg.room_limit > currentSubscription.room_limit;
                        const isDisabled = currentSubscription && !isCurrent && !isUpgrade;
                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-xl relative overflow-hidden ${
                                    isCurrent ? 'border-emerald-500 shadow-lg shadow-emerald-500/5' : 'border-gray-100 hover:border-gray-200'
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-md">
                                        Đang sử dụng
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800">{pkg.name}</h4>
                                        <p className="text-slate-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">
                                            Thời hạn:{' '}
                                            {pkg.duration_type === 'onetime' 
                                                ? `Dùng thử ${pkg.duration_value} ngày (1 lần)` 
                                                : `${pkg.duration_value || pkg.duration_months} ${pkg.duration_type === 'week' ? 'tuần' : pkg.duration_type === 'year' ? 'năm' : 'tháng'}`}
                                        </p>
                                    </div>

                                    <div className="py-2">
                                        <span className="text-2xl font-black text-teal-800">{formatVND(pkg.price)}</span>
                                        <span className="text-slate-400 text-xs font-bold"> / gói cước</span>
                                    </div>

                                    <div className="h-px bg-gray-50 my-2"></div>

                                    <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
                                        {pkg.description || 'Gói cước cao cấp hỗ trợ vận hành và quản lý hoạt động cho thuê nhà trọ chuyên nghiệp.'}
                                    </p>

                                    <ul className="space-y-2 text-xs text-slate-600 font-semibold pt-2">
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Hạn mức: <span className="font-bold text-slate-800">{pkg.room_limit === 9999 ? 'Không giới hạn' : `${pkg.room_limit} phòng`}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-50">
                                    <button
                                        onClick={() => handleSubscribeClick(pkg)}
                                        disabled={processing || isDisabled}
                                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-75 ${
                                            isCurrent
                                                ? 'border border-emerald-500 text-emerald-700 bg-emerald-50/20 hover:bg-emerald-50/40'
                                                : isDisabled
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10'
                                        }`}
                                    >
                                        {processing ? 'Đang giao dịch...' : isCurrent ? 'Gia hạn gói cước' : isUpgrade ? 'Nâng cấp ngay' : 'Đăng ký ngay'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-base font-bold text-teal-900">Lịch sử giao dịch</h3>
                    <p className="text-xs text-gray-400 mt-1">Lịch sử đăng ký và thanh toán các gói bản quyền phần mềm</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Gói cước</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Số tiền trả</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Thời hạn sử dụng</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Thời gian mua</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Trạng thái gói</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Thanh toán</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                                        Bạn chưa thực hiện giao dịch mua gói nào.
                                    </td>
                                </tr>
                            ) : (
                                history.map((hist) => (
                                    <tr key={hist.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="p-4 font-bold text-teal-900">{hist.package_name}</td>
                                        <td className="p-4 font-black text-slate-800">{formatVND(hist.price_paid)}</td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {hist.start_date} đến {hist.end_date}
                                        </td>
                                        <td className="p-4 text-gray-400">{hist.created_at}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                hist.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                    : (hist.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500')
                                            }`}>
                                                {hist.status === 'active' ? 'Hoạt động' : (hist.status === 'pending' ? 'Chờ kích hoạt' : 'Hết hạn')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-emerald-600 font-bold">Thành công</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAYMENT MODAL (POP-UP OVERLAY FOR TRANSACTIONS) */}
            {showPaymentModal && selectedPkg && (
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
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Giao dịch giả lập - Test nhanh</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {/* VietQR Code Image */}
                            <div className="w-40 h-40 bg-white border border-teal-100 rounded-2xl p-1.5 flex flex-col items-center justify-center relative overflow-hidden shadow-sm shrink-0">
                                <img
                                    src={qrUrl}
                                    alt="VietQR Chuyển khoản"
                                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-all duration-200"
                                    onClick={() => setShowZoomModal(true)}
                                    title="Bấm để phóng to và tải về"
                                />
                            </div>

                            {/* Details */}
                            <div className="w-full text-xs space-y-2 text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span>Gói dịch vụ:</span>
                                    <strong className="text-slate-800 font-bold">{selectedPkg.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Số tiền cước:</span>
                                    <strong className="text-emerald-600 font-black text-sm">{formatVND(selectedPkg.price)}</strong>
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
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox phóng to QR */}
            {showZoomModal && selectedPkg && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 flex flex-col items-center shadow-2xl border border-slate-100/10">
                        <button
                            onClick={() => setShowZoomModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 font-bold text-lg p-1.5 transition-colors"
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
                                        link.download = `vietqr-subscription-pkg${selectedPkg.id}.png`;
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
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;
