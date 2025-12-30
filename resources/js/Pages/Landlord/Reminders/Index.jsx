import { Link, usePage, router, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { reminders, filters } = usePage().props;
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');

    // Auto-refresh logic remains the same
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['reminders'], preserveScroll: true });
        }, 60000); 
        return () => clearInterval(interval);
    }, []);

    const handleFilterChange = (type, status) => {
        router.get(route('landlord.reminders.index'), {
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        handleFilterChange(newType, selectedStatus);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        handleFilterChange(selectedType, newStatus);
    };

    const handleMarkAsSent = (reminderId) => {
        // Optimistic UI update could be added here
        router.post(route('landlord.reminders.markAsSent', reminderId), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (reminderId) => {
        if (confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
            router.delete(route('landlord.reminders.destroy', reminderId));
        }
    };

    const getTypeConfig = (type) => {
        const config = {
            payment: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán', icon: '💰' },
            contract_expiry: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Hết hạn HĐ', icon: '⏳' },
            bill_creation: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Tạo hóa đơn', icon: '📝' },
            bill_payment: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Thu tiền', icon: '💸' },
        };
        return config[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Khác', icon: '🔔' };
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Nhắc nhở & Thông báo" />
            
            <div className="max-w-[1200px] mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Trung tâm thông báo
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Nhắc nhở công việc</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="payment">💰 Thanh toán</option>
                            <option value="contract_expiry">⏳ Hết hạn HĐ</option>
                            <option value="bill_creation">📝 Tạo hóa đơn</option>
                            <option value="bill_payment">💸 Thu tiền</option>
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="bg-white border border-gray-200 rounded-xl px-6 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">⚠️ Cần xử lý</option>
                            <option value="upcoming">📅 Sắp tới</option>
                            <option value="sent">✅ Đã gửi</option>
                        </select>

                       
                    </div>
                </div>

                {/* --- REMINDERS LIST --- */}
                {reminders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Không có nhắc nhở nào cần xử lý.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reminders.data.map((reminder) => {
                            const typeConfig = getTypeConfig(reminder.type);
                            const isOverdue = new Date(reminder.reminder_date) <= new Date() && !reminder.is_sent;
                            const isSent = reminder.is_sent;

                            return (
                                <div 
                                    key={reminder.id} 
                                    className={`group bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-4 ${
                                        isOverdue ? 'border-rose-200 hover:border-rose-300 hover:shadow-rose-100' : 
                                        isSent ? 'border-gray-100 opacity-75 hover:opacity-100' : 'border-gray-100 hover:border-emerald-200 hover:shadow-emerald-50'
                                    }`}
                                >
                                    {/* Left Status Bar */}
                                    <div className={`w-1.5 h-12 rounded-full flex-shrink-0 hidden md:block ${
                                        isSent ? 'bg-gray-300' : 
                                        isOverdue ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}></div>

                                    {/* 1. Date & Type */}
                                    <div className="flex items-center gap-4 min-w-[180px]">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                                            isSent ? 'bg-gray-100 text-gray-400' : 
                                            isOverdue ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            <span className="font-bold text-lg">{new Date(reminder.reminder_date).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                                                Tháng {new Date(reminder.reminder_date).getMonth() + 1}
                                            </p>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${typeConfig.bg} ${typeConfig.text}`}>
                                                <span>{typeConfig.icon}</span> {typeConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Content (Middle) */}
                                    <div className="flex-grow">
                                        <h3 className={`font-bold text-lg ${isSent ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {reminder.message || 'Không có nội dung'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <span>{reminder.contract.room.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="truncate max-w-[150px]">{reminder.contract.renter_request?.name || 'Không tên'}</span>
                                        </div>
                                    </div>

                                    {/* 3. Actions (Right) */}
                                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-none border-gray-50 pt-4 lg:pt-0 mt-2 lg:mt-0">
                                     
                                     
                                           <Link
                                            href={route('landlord.reminders.show', reminder.id)}
                                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            Chi tiết
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>

                                 
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {reminders.links && reminders.links.length > 3 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {reminders.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    link.active
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : !link.url
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;