import { Link, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show() {
    const { room, contract } = usePage().props;

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đang hiệu lực', dot: 'bg-emerald-500' },
            terminated: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Đã chấm dứt', dot: 'bg-rose-500' },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Hết hạn', dot: 'bg-gray-500' },
        };
        const style = config[status] || config.expired;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
                {style.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Chi tiết hợp đồng - ${contract.renterRequest?.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.rooms.contracts.index', room.id)}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách hợp đồng
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                            <div>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight mb-2">Chi tiết hợp đồng thuê</h1>
                                <p className="text-gray-500 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Phòng <span className="font-bold text-gray-900">{room.name}</span>
                                    <span className="text-gray-300 mx-1">•</span>
                                    {room.house.name}
                                </p>
                            </div>
                            <div>
                                {getStatusBadge(contract.status)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Tenant Info */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                                Thông tin người thuê
                            </h2>
                            
                            {contract.renterRequest ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {contract.renterRequest.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Họ và tên</p>
                                            <p className="font-bold text-gray-900">{contract.renterRequest.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-3 border border-gray-100 rounded-xl">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Số điện thoại</p>
                                            <p className="font-semibold text-gray-900">{contract.renterRequest.phone}</p>
                                        </div>
                                        <div className="p-3 border border-gray-100 rounded-xl">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                            <p className="font-semibold text-gray-900">{contract.renterRequest.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">
                                    Không tìm thấy thông tin người thuê
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Contract Info */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                                Chi tiết hợp đồng
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Ngày bắt đầu</p>
                                        <p className="font-bold text-gray-900">{new Date(contract.start_date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ngày kết thúc</p>
                                        <p className="font-bold text-gray-900">{new Date(contract.end_date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-3 border-b border-dashed border-gray-200">
                                    <span className="text-gray-500 text-sm">Giá thuê</span>
                                    <span className="font-bold text-emerald-600 text-lg">{(contract.monthly_rent || 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-dashed border-gray-200">
                                    <span className="text-gray-500 text-sm">Tiền cọc</span>
                                    <span className="font-bold text-gray-900">{(contract.deposit || 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</span>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-gray-500 text-sm">Ngày thanh toán</span>
                                    <span className="font-bold text-gray-900">Ngày {contract.payment_date} hàng tháng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TERMS SECTION */}
                <div className="mt-8 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Điều khoản hợp đồng</h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {contract.terms || 'Không có điều khoản bổ sung.'}
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-8 flex flex-wrap gap-4 justify-end border-t border-gray-200 pt-6">
                    <Link
                        href={route('landlord.rooms.contracts.edit', [room.id, contract.id])}
                        className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Chỉnh sửa
                    </Link>

                    {contract.status === 'active' && (
                        <Link
                            as="button"
                            method="put"
                            href={route('landlord.rooms.contracts.update', [room.id, contract.id])}
                            data={{ status: 'terminated' }}
                            className="px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition-all flex items-center gap-2"
                            onClick={(e) => {
                                if (!confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng này sớm không?')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Chấm dứt hợp đồng
                        </Link>
                    )}

                    <Link
                        as="button"
                        method="delete"
                        href={route('landlord.rooms.contracts.destroy', [room.id, contract.id])}
                        className="px-6 py-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold hover:bg-rose-200 transition-all flex items-center gap-2"
                        onClick={(e) => {
                            if (!confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa hợp đồng này?')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Xóa hợp đồng
                    </Link>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;