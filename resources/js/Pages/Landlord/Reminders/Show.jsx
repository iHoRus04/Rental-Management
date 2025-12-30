import { Link, router, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show() {
    const { reminder } = usePage().props;

    const handleMarkAsSent = () => {
        // Optimistic update can be added here
        router.post(route('landlord.reminders.markAsSent', reminder.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
            router.delete(route('landlord.reminders.destroy', reminder.id));
        }
    };

    const getTypeConfig = (type) => {
        const config = {
            payment: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán', icon: '💰' },
            contract_expiry: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Hết hạn hợp đồng', icon: '⏳' },
            bill_creation: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Tạo hóa đơn', icon: '📝' },
            bill_payment: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Thanh toán hóa đơn', icon: '💸' },
        };
        return config[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Khác', icon: '🔔' };
    };

    const typeConfig = getTypeConfig(reminder.type);
    const isOverdue = new Date(reminder.reminder_date) <= new Date() && !reminder.is_sent;

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Chi tiết nhắc nhở" />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.reminders.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-sm ${typeConfig.bg} ${typeConfig.text}`}>
                                {typeConfig.icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight mb-1">
                                    Chi tiết nhắc nhở
                                </h1>
                                <p className="text-gray-500 font-medium flex items-center gap-2">
                                    Ngày tạo: {new Date(reminder.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="relative z-10">
                            {reminder.is_sent ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> Đã hoàn thành
                                </span>
                            ) : isOverdue ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-600 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Cần xử lý gấp
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sắp tới
                                </span>
                            )}
                        </div>

                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Reminder Info */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                            Thông tin chính
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Loại nhắc nhở</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${typeConfig.bg} ${typeConfig.text}`}>
                                    {typeConfig.label}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Ngày đến hạn</p>
                                <p className="text-xl font-bold text-gray-900">{new Date(reminder.reminder_date).toLocaleDateString('vi-VN')}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Nội dung</p>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
                                    {reminder.message || "Không có nội dung chi tiết."}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                            {!reminder.is_sent && (
                                <button
                                    onClick={handleMarkAsSent}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Đánh dấu đã xong
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Xóa nhắc nhở
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Related Info */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
                            Thông tin liên quan
                        </h2>

                        {reminder.contract ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                            {reminder.contract.room.name.replace(/[^0-9]/g, '')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">{reminder.contract.room.name}</p>
                                            <p className="text-xs text-blue-600">{reminder.contract.room.house.name}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-blue-200/50">
                                        <p className="text-xs text-blue-500 font-bold uppercase mb-1">Người thuê</p>
                                        <p className="font-bold text-gray-900">{reminder.contract.renter_request?.name || '---'}</p>
                                        <p className="text-sm text-gray-600 mt-1">{reminder.contract.renter_request?.phone || '---'}</p>
                                        <p className="text-sm text-gray-600 mt-1">{reminder.contract.renter_request?.email || '---'}</p>
                                      
                                    </div>
                                    
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Chi tiết hợp đồng</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Giá thuê:</span>
                                            <span className="font-bold text-gray-900">{Math.floor(reminder.contract.monthly_rent).toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Ngày bắt đầu:</span>
                                            <span className="font-medium text-gray-900">{new Date(reminder.contract.start_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Ngày kết thúc:</span>
                                            <span className="font-medium text-gray-900">{new Date(reminder.contract.end_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>Không có thông tin hợp đồng liên quan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;