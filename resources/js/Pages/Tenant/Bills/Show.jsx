import { Head, Link, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';
import { useState } from 'react';

export default function Show({ auth, bill }) {
    const [copiedText, setCopiedText] = useState('');
    const [showZoomModal, setShowZoomModal] = useState(false);
    const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v ?? 0);
    const snapshot = bill.price_snapshot || {};
    const serviceDetails = bill.service_details || [];

    const getStatusConfig = (status) => {
        const configs = {
            paid:    { label: 'Đã thanh toán', bg: 'bg-emerald-100', text: 'text-emerald-700' },
            pending: { label: 'Chưa thanh toán', bg: 'bg-amber-100', text: 'text-amber-700' },
            partial: { label: 'Thanh toán một phần', bg: 'bg-blue-100', text: 'text-blue-700' },
            overdue: { label: 'Quá hạn', bg: 'bg-red-100', text: 'text-red-700' },
        };
        return configs[status] || configs.pending;
    };

    const statusCfg = getStatusConfig(bill.status);
    const remaining = bill.amount - bill.paid_amount;

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    };

    const house = bill.room?.house || {};
    const hasBankSetup = house.bank_name && house.account_no && house.account_name;
    const isUnpaid = bill.status !== 'paid';

    const handlePayTest = () => {
        if (confirm('Bạn có chắc muốn thực hiện giả lập THANH TOÁN (thành Đã thanh toán) cho hóa đơn này để test?')) {
            router.post(route('tenant.bills.payTest', bill.id));
        }
    };

    const getUnitLabel = (unit) => {
        const map = { kwh: 'kWh', m3: 'm³', month: 'Tháng', service: 'Dịch vụ' };
        return map[unit] || unit;
    };

    return (
        <TenantLayout user={auth.user}>
            <Head title={`Hóa đơn tháng ${bill.month}/${bill.year}`} />
            <div className="p-6 md:p-10 max-w-[900px] mx-auto font-sans">
                {/* Back Link */}
                <Link
                    href={route('tenant.bills.index')}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại danh sách hóa đơn
                </Link>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-extrabold">
                                    Hóa đơn tháng {bill.month}/{bill.year}
                                </h1>
                                <p className="text-emerald-100 mt-1">{bill.room?.name}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Tóm tắt */}
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 font-medium">Tổng cộng</p>
                            <p className="text-xl font-extrabold text-gray-800 mt-1">{fmt(bill.amount)}₫</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <p className="text-sm text-emerald-600 font-medium">Đã thanh toán</p>
                            <p className="text-xl font-extrabold text-emerald-700 mt-1">{fmt(bill.paid_amount)}₫</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-xl">
                            <p className="text-sm text-red-500 font-medium">Còn nợ</p>
                            <p className="text-xl font-extrabold text-red-600 mt-1">{fmt(remaining > 0 ? remaining : 0)}₫</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-xl">
                            <p className="text-sm text-amber-600 font-medium">Hạn thanh toán</p>
                            <p className="text-lg font-bold text-amber-700 mt-1">
                                {bill.due_date ? new Date(bill.due_date).toLocaleDateString('vi-VN') : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Thanh toán VietQR */}
                {isUnpaid && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6 p-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-lg">💸</span> Thanh toán chuyển khoản nhanh qua QR
                            </h2>
                            <button
                                onClick={handlePayTest}
                                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                🧪 Thanh toán (Test)
                            </button>
                        </div>
                        
                        {!hasBankSetup ? (
                            <div className="p-4 bg-amber-50/50 text-amber-800 rounded-xl border border-amber-100 text-xs font-semibold leading-normal">
                                💡 Chủ nhà chưa thiết lập tài khoản nhận tiền ngân hàng trên hệ thống. Vui lòng liên hệ trực tiếp chủ nhà để thanh toán tiền phòng bằng các phương thức khác.
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* Left Side: Account Info */}
                                <div className="flex-1 space-y-4 w-full text-xs font-semibold text-slate-600">
                                    <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-400">Ngân hàng:</span>
                                            <span className="font-extrabold text-slate-800 uppercase">{house.bank_name}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-400">Số tài khoản:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-800">{house.account_no}</span>
                                                <button
                                                    onClick={() => handleCopy(house.account_no, 'stk')}
                                                    className="px-2 py-0.5 bg-slate-200 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-bold transition-colors"
                                                >
                                                    {copiedText === 'stk' ? 'Đã chép!' : 'Chép'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-400">Chủ tài khoản:</span>
                                            <span className="font-black text-slate-850 uppercase">{house.account_name}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-400">Số tiền:</span>
                                            <span className="font-extrabold text-rose-600 text-sm">{fmt(remaining)}₫</span>
                                        </div>

                                        <div className="flex justify-col md:flex-row justify-between items-start md:items-center py-2 gap-2">
                                            <span className="text-slate-400">Nội dung CK:</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-slate-800 text-[10px] bg-slate-200/50 px-2 py-0.5 rounded border border-slate-300/40 select-all">
                                                    {`THANH TOAN HD T${bill.month} PHONG ${bill.room?.name || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, "")}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(`THANH TOAN HD T${bill.month} PHONG ${bill.room?.name || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, ""), 'nd')}
                                                    className="px-2 py-0.5 bg-slate-200 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-bold transition-colors"
                                                >
                                                    {copiedText === 'nd' ? 'Đã chép!' : 'Chép'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                                        * Lưu ý: Hãy quét mã QR bên phải bằng app ngân hàng của bạn để thông tin ngân hàng, số tiền và nội dung chuyển khoản được nhập tự động và chính xác 100%.
                                    </p>
                                </div>

                                {/* Right Side: QR Code Image */}
                                <div className="w-52 shrink-0 flex flex-col items-center justify-center p-4 bg-emerald-55/10 border border-emerald-100 rounded-2xl">
                                    <div className="w-40 h-40 bg-white rounded-xl border border-slate-100 p-1 flex items-center justify-center shadow-inner-sm overflow-hidden">
                                        <img
                                            src={`https://img.vietqr.io/image/${house.bank_name}-${house.account_no}-compact2.png?amount=${remaining}&addInfo=${encodeURIComponent(`THANH TOAN HD T${bill.month} PHONG ${bill.room?.name || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, ""))}&accountName=${encodeURIComponent(house.account_name)}`}
                                            alt="VietQR code"
                                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-all duration-200"
                                            onClick={() => setShowZoomModal(true)}
                                            title="Bấm để phóng to và tải về"
                                        />
                                    </div>
                                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest mt-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Quét VietQR tự động
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bảng kê chi tiết */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Bảng kê chi tiết
                        </h2>
                    </div>
                    <div className="p-6">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500">Khoản mục</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-500">Số lượng</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-500">Đơn giá</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-500">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Tiền phòng */}
                                <tr className="border-b border-gray-50">
                                    <td className="py-3 px-2 font-medium text-gray-800">🏠 Tiền phòng</td>
                                    <td className="py-3 px-2 text-right text-gray-500">1 tháng</td>
                                    <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.room_price)}₫</td>
                                    <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.room_price)}₫</td>
                                </tr>

                                {/* Tiền điện */}
                                {bill.electric_kwh > 0 && (
                                    <tr className="border-b border-gray-50">
                                        <td className="py-3 px-2 font-medium text-gray-800">⚡ Tiền điện</td>
                                        <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.electric_kwh)} kWh</td>
                                        <td className="py-3 px-2 text-right text-gray-500">
                                            {fmt(snapshot.electric_unit_price || bill.electric_price)}₫/kWh
                                        </td>
                                        <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.electric_cost)}₫</td>
                                    </tr>
                                )}

                                {/* Tiền nước */}
                                {bill.water_usage > 0 && (
                                    <tr className="border-b border-gray-50">
                                        <td className="py-3 px-2 font-medium text-gray-800">💧 Tiền nước</td>
                                        <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.water_usage)} m³</td>
                                        <td className="py-3 px-2 text-right text-gray-500">
                                            {fmt(snapshot.water_unit_price || bill.water_price)}₫/m³
                                        </td>
                                        <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.water_cost)}₫</td>
                                    </tr>
                                )}

                                {/* Dịch vụ cố định từ service_details */}
                                {serviceDetails
                                    .filter(s => s.type === 'fixed')
                                    .map((svc, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-3 px-2 font-medium text-gray-800">📋 {svc.name}</td>
                                            <td className="py-3 px-2 text-right text-gray-500">1 {getUnitLabel(svc.unit)}</td>
                                            <td className="py-3 px-2 text-right text-gray-500">{fmt(svc.unit_price)}₫</td>
                                            <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(svc.total)}₫</td>
                                        </tr>
                                    ))
                                }

                                {/* Phí dịch vụ cố định (nếu không có chi tiết dịch vụ) */}
                                {bill.service_costs > 0 && serviceDetails.filter(s => s.type === 'fixed').length === 0 && (
                                    <tr className="border-b border-gray-50">
                                        <td className="py-3 px-2 font-medium text-gray-800">📋 Phí dịch vụ cố định</td>
                                        <td className="py-3 px-2 text-right text-gray-500">1 tháng</td>
                                        <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.service_costs)}₫</td>
                                        <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.service_costs)}₫</td>
                                    </tr>
                                )}

                                {/* Fallback: nếu không có service_details thì hiển thị gộp internet/rác */}
                                {serviceDetails.filter(s => s.type === 'fixed').length === 0 && (
                                    <>
                                        {bill.internet_cost > 0 && (
                                            <tr className="border-b border-gray-50">
                                                <td className="py-3 px-2 font-medium text-gray-800">🌐 Internet</td>
                                                <td className="py-3 px-2 text-right text-gray-500">1 tháng</td>
                                                <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.internet_cost)}₫</td>
                                                <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.internet_cost)}₫</td>
                                            </tr>
                                        )}
                                        {bill.trash_cost > 0 && (
                                            <tr className="border-b border-gray-50">
                                                <td className="py-3 px-2 font-medium text-gray-800">🗑️ Phí rác</td>
                                                <td className="py-3 px-2 text-right text-gray-500">1 tháng</td>
                                                <td className="py-3 px-2 text-right text-gray-500">{fmt(bill.trash_cost)}₫</td>
                                                <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.trash_cost)}₫</td>
                                            </tr>
                                        )}
                                    </>
                                )}

                                {/* Chi phí khác */}
                                {bill.other_costs > 0 && (
                                    <tr className="border-b border-gray-50">
                                        <td className="py-3 px-2 font-medium text-gray-800">📦 Chi phí khác</td>
                                        <td className="py-3 px-2 text-right text-gray-500">—</td>
                                        <td className="py-3 px-2 text-right text-gray-500">—</td>
                                        <td className="py-3 px-2 text-right font-bold text-gray-800">{fmt(bill.other_costs)}₫</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-emerald-200">
                                    <td colSpan={3} className="py-4 px-2 text-right font-extrabold text-lg text-gray-800">
                                        TỔNG CỘNG
                                    </td>
                                    <td className="py-4 px-2 text-right font-extrabold text-xl text-emerald-600">
                                        {fmt(bill.amount)}₫
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Biểu giá áp dụng (Price Snapshot) */}
                {snapshot.services && snapshot.services.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Biểu giá áp dụng
                                <span className="text-xs font-normal text-gray-400 ml-2">
                                    (Đóng băng tại thời điểm tạo hóa đơn)
                                </span>
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {snapshot.services.map((svc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-700 text-sm">{svc.name}</span>
                                        <span className="font-bold text-emerald-600 text-sm">
                                            {fmt(svc.price)}₫/{getUnitLabel(svc.unit)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {snapshot.snapshot_at && (
                                <p className="text-xs text-gray-400 mt-3 text-right">
                                    Chốt giá lúc: {new Date(snapshot.snapshot_at).toLocaleString('vi-VN')}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Lịch sử thanh toán */}
                {bill.payments && bill.payments.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Lịch sử thanh toán
                            </h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {bill.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-emerald-700">{fmt(payment.amount)}₫</p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                            <span className="mx-1">•</span>
                                            {payment.payment_method === 'cash' ? 'Tiền mặt' :
                                             payment.payment_method === 'bank_transfer' ? 'Chuyển khoản' :
                                             payment.payment_method === 'check' ? 'Séc' : 'Khác'}
                                        </p>
                                        {payment.bank_transaction_code && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Mã GD: {payment.bank_transaction_code}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {payment.verified_by_user && (
                                            <p className="text-xs text-gray-500">
                                                Xác nhận bởi: <span className="font-semibold">{payment.verified_by_user.name}</span>
                                            </p>
                                        )}
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                                            ✓ Đã xác nhận
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {bill.notes && (
                    <div className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-100">
                        <h3 className="font-bold text-amber-800 mb-2">📝 Ghi chú</h3>
                        <p className="text-amber-700 text-sm">{bill.notes}</p>
                    </div>
                )}
            </div>

            {/* Lightbox phóng to QR */}
            {showZoomModal && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 flex flex-col items-center shadow-2xl border border-slate-100/10">
                        <button
                            onClick={() => setShowZoomModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 font-bold text-lg p-1.5 transition-colors"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                            Quét mã thanh toán phòng
                        </h3>
                        
                        <div className="w-72 h-72 bg-white rounded-2xl border border-slate-100 p-2 flex items-center justify-center shadow-inner-sm overflow-hidden mb-6">
                            <img
                                src={`https://img.vietqr.io/image/${house.bank_name}-${house.account_no}-compact2.png?amount=${remaining}&addInfo=${encodeURIComponent(`THANH TOAN HD T${bill.month} PHONG ${bill.room?.name || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, ""))}&accountName=${encodeURIComponent(house.account_name)}`}
                                alt="VietQR code enlarged"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={async () => {
                                    const url = `https://img.vietqr.io/image/${house.bank_name}-${house.account_no}-compact2.png?amount=${remaining}&addInfo=${encodeURIComponent(`THANH TOAN HD T${bill.month} PHONG ${bill.room?.name || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").replace(/[^A-Z0-9 ]/g, ""))}&accountName=${encodeURIComponent(house.account_name)}`;
                                    try {
                                        const response = await fetch(url);
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = `vietqr-phong-${bill.room?.name || 'room'}-t${bill.month}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl);
                                    } catch (e) {
                                        window.open(url, '_blank');
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
        </TenantLayout>
    );
}
