import { Link, usePage, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Show() {
    const { room, contract } = usePage().props;

    const [showRenewModal, setShowRenewModal] = useState(false);
    const [renewMode, setRenewMode] = useState('months'); // 'months' | 'custom'
    const [selectedMonths, setSelectedMonths] = useState(null);
    const [customDate, setCustomDate] = useState('');
    const [renewProcessing, setRenewProcessing] = useState(false);

    // ── Helpers ──────────────────────────────────────────────
    const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v ?? 0);

    const getStatusBadge = (status) => {
        const config = {
            active:     { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đang hiệu lực',  dot: 'bg-emerald-500' },
            terminated: { bg: 'bg-rose-100',    text: 'text-rose-700',    label: 'Đã chấm dứt',   dot: 'bg-rose-500'    },
            expired:    { bg: 'bg-gray-100',    text: 'text-gray-700',    label: 'Hết hạn',        dot: 'bg-gray-400'    },
        };
        const style = config[status] || config.expired;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} ${status === 'active' ? 'animate-pulse' : ''}`}></span>
                {style.label}
            </span>
        );
    };

    // Days remaining
    const daysRemaining = contract.end_date
        ? Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const getDaysLabel = () => {
        if (daysRemaining === null) return null;
        if (daysRemaining < 0)  return { text: `Đã hết hạn ${Math.abs(daysRemaining)} ngày trước`, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' };
        if (daysRemaining === 0) return { text: 'Hết hạn hôm nay!', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' };
        if (daysRemaining <= 30) return { text: `Còn ${daysRemaining} ngày`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' };
        return { text: `Còn ${daysRemaining} ngày`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' };
    };

    const daysInfo = getDaysLabel();

    // ── Preview new end date when months selected ──────────────
    const previewDate = () => {
        if (renewMode === 'months' && selectedMonths) {
            const base = contract.end_date && new Date(contract.end_date) > new Date()
                ? new Date(contract.end_date)
                : new Date();
            base.setMonth(base.getMonth() + selectedMonths);
            return base.toLocaleDateString('vi-VN');
        }
        if (renewMode === 'custom' && customDate) {
            return new Date(customDate).toLocaleDateString('vi-VN');
        }
        return null;
    };

    // ── Submit renew ───────────────────────────────────────────
    const handleRenew = () => {
        if (renewMode === 'months' && !selectedMonths) return;
        if (renewMode === 'custom' && !customDate) return;

        setRenewProcessing(true);
        const payload = renewMode === 'months'
            ? { months: selectedMonths }
            : { new_end_date: customDate };

        router.post(
            route('landlord.rooms.contracts.renew', { room: room.id, contract: contract.id }),
            payload,
            { onFinish: () => setRenewProcessing(false) }
        );
    };

    const QUICK_MONTHS = [
        { label: '3 tháng',  value: 3  },
        { label: '6 tháng',  value: 6  },
        { label: '12 tháng', value: 12 },
        { label: '24 tháng', value: 24 },
    ];

    // ── Min date for custom picker (tomorrow) ─────────────────
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Chi tiết hợp đồng - ${contract.renterRequest?.name}`} />

            <div className="max-w-4xl mx-auto">
                {/* ── BACK LINK ── */}
                <Link
                    href={route('landlord.rooms.contracts.index', room.id)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-6 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại danh sách hợp đồng
                </Link>

                {/* ── HEADER CARD ── */}
                <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight mb-2">
                                Chi tiết hợp đồng thuê
                            </h1>
                            <p className="text-gray-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Phòng <span className="font-bold text-gray-900">{room.name}</span>
                                <span className="text-gray-300 mx-1">•</span>
                                {room.house.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {daysInfo && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${daysInfo.bg} ${daysInfo.color}`}>
                                    🕐 {daysInfo.text}
                                </span>
                            )}
                            {getStatusBadge(contract.status)}
                        </div>
                    </div>
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Tenant info */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            Thông tin người thuê
                        </h2>

                        {contract.renterRequest ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                                        {contract.renterRequest.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Họ và tên</p>
                                        <p className="font-extrabold text-gray-900">{contract.renterRequest.name}</p>
                                    </div>
                                </div>
                                <div className="p-3 border border-gray-100 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Số điện thoại</p>
                                    <p className="font-semibold text-gray-900">{contract.renterRequest.phone || '—'}</p>
                                </div>
                                <div className="p-3 border border-gray-100 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{contract.renterRequest.email || '—'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">
                                Không tìm thấy thông tin người thuê
                            </div>
                        )}
                    </div>

                    {/* Contract details */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </span>
                            Chi tiết hợp đồng
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Ngày bắt đầu</p>
                                    <p className="font-bold text-gray-900">{new Date(contract.start_date).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className={`p-3 rounded-xl border ${daysInfo ? daysInfo.bg : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ngày kết thúc</p>
                                    <p className={`font-bold ${daysInfo ? daysInfo.color : 'text-gray-900'}`}>
                                        {contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 border-b border-dashed border-gray-200">
                                <span className="text-gray-500 text-sm">Giá thuê hàng tháng</span>
                                <span className="font-extrabold text-emerald-600 text-lg">{fmt(contract.monthly_rent)} ₫</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border-b border-dashed border-gray-200">
                                <span className="text-gray-500 text-sm">Tiền cọc</span>
                                <span className="font-bold text-gray-900">{fmt(contract.deposit)} ₫</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-gray-500 text-sm">Ngày thanh toán</span>
                                <span className="font-bold text-gray-900">Ngày {contract.payment_date} hàng tháng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TERMS ── */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Điều khoản hợp đồng</h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {contract.terms || 'Không có điều khoản bổ sung.'}
                    </div>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="flex flex-wrap gap-3 justify-end border-t border-gray-200 pt-6">
                    {/* Gia hạn */}
                    {contract.status === 'expired' && (
                        <button
                            onClick={() => setShowRenewModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Gia hạn hợp đồng
                        </button>
                    )}

                {/* Xuất PDF */}
                    <a
                        href={route('landlord.rooms.contracts.pdf', { room: room.id, contract: contract.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-red-400 hover:text-red-600 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Xuất PDF
                    </a>

                    <Link
                        href={route('landlord.rooms.contracts.edit', [room.id, contract.id])}
                        className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh sửa
                    </Link>

                    {contract.status === 'active' && (
                        <Link
                            as="button"
                            method="put"
                            href={route('landlord.rooms.contracts.update', [room.id, contract.id])}
                            data={{ status: 'terminated' }}
                            className="px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition-all flex items-center gap-2"
                            onClick={(e) => { if (!confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng này sớm không?')) e.preventDefault(); }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Chấm dứt hợp đồng
                        </Link>
                    )}

                    <Link
                        as="button"
                        method="delete"
                        href={route('landlord.rooms.contracts.destroy', [room.id, contract.id])}
                        className="px-6 py-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold hover:bg-rose-200 transition-all flex items-center gap-2"
                        onClick={(e) => { if (!confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa hợp đồng này?')) e.preventDefault(); }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa hợp đồng
                    </Link>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                  RENEW MODAL
            ══════════════════════════════════════════════════ */}
            {showRenewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Modal header */}
                        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">🔄</div>
                                        <div>
                                            <h3 className="text-xl font-extrabold tracking-tight">Gia hạn hợp đồng</h3>
                                            <p className="text-emerald-200 text-xs mt-0.5">
                                                Phòng {room.name} • {contract.renterRequest?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRenewModal(false)}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {contract.end_date && (
                                    <div className="mt-4 bg-white/10 rounded-xl px-4 py-2.5 text-sm">
                                        Hợp đồng hiện tại kết thúc ngày:{' '}
                                        <span className="font-extrabold">
                                            {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                                        </span>
                                        {daysRemaining !== null && (
                                            <span className={`ml-2 font-semibold ${daysRemaining < 0 ? 'text-rose-300' : 'text-emerald-200'}`}>
                                                ({daysRemaining < 0 ? `đã hết hạn ${Math.abs(daysRemaining)} ngày` : `còn ${daysRemaining} ngày`})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-6">
                            {/* Mode toggle */}
                            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-bold">
                                <button
                                    onClick={() => { setRenewMode('months'); setCustomDate(''); }}
                                    className={`flex-1 py-2.5 transition-colors ${renewMode === 'months' ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    ⏱️ Chọn số tháng
                                </button>
                                <button
                                    onClick={() => { setRenewMode('custom'); setSelectedMonths(null); }}
                                    className={`flex-1 py-2.5 transition-colors ${renewMode === 'custom' ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    📅 Chọn ngày cụ thể
                                </button>
                            </div>

                            {/* Months quick-select */}
                            {renewMode === 'months' && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chọn thời hạn gia hạn</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {QUICK_MONTHS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSelectedMonths(opt.value)}
                                                className={`py-3 rounded-xl border-2 font-extrabold text-sm transition-all hover:scale-105 ${
                                                    selectedMonths === opt.value
                                                        ? 'bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-teal-400'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs font-bold text-gray-400 mb-1.5">Hoặc nhập số tháng tùy chỉnh:</p>
                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            placeholder="Ví dụ: 18"
                                            value={selectedMonths && ![3,6,12,24].includes(selectedMonths) ? selectedMonths : ''}
                                            onChange={(e) => setSelectedMonths(parseInt(e.target.value) || null)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Custom date picker */}
                            {renewMode === 'custom' && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ngày kết thúc hợp đồng mới</p>
                                    <input
                                        type="date"
                                        min={minDate}
                                        value={customDate}
                                        onChange={(e) => setCustomDate(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            )}

                            {/* Preview */}
                            {previewDate() && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm">✓</div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Ngày kết thúc mới</p>
                                        <p className="text-lg font-extrabold text-emerald-800">{previewDate()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowRenewModal(false)}
                                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleRenew}
                                disabled={renewProcessing || (renewMode === 'months' ? !selectedMonths : !customDate)}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-extrabold hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                            >
                                {renewProcessing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang gia hạn...
                                    </>
                                ) : (
                                    <>🔄 Xác nhận gia hạn</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;