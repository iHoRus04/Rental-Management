import { Link, usePage, router, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index() {
    const { reminders, filters, houses = [], selectedHouse = null, auth } = usePage().props;
    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canDeleteReminder = isLandlord || userPerms.includes('reminders.delete');

    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

    // Auto-refresh logic remains the same
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['reminders'], preserveScroll: true });
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleFilterChange = (type, status, houseId) => {
        router.get(route('landlord.reminders.index'), {
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
            house_id: houseId !== 'all' ? houseId : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        handleFilterChange(newType, selectedStatus, selectedHouse?.id || 'all');
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        handleFilterChange(selectedType, newStatus, selectedHouse?.id || 'all');
    };

    const handleMarkAsSent = (reminderId) => {
        router.post(route('landlord.reminders.markAsSent', reminderId), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (reminderId) => {
        setConfirmDelete({ show: true, id: reminderId });
    };

    const executeDelete = () => {
        router.delete(route('landlord.reminders.destroy', confirmDelete.id), {
            onFinish: () => setConfirmDelete({ show: false, id: null }),
        });
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

            <div className="max-w-[1400px] mx-auto">

                {/* HOUSE LIST GRID VIEW */}
                {!selectedHouse ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Trung tâm thông báo
                                </p>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Nhắc nhở công việc</h1>
                                <p className="text-gray-500 mt-1 text-sm">Chọn nhà trọ/căn hộ để xem các việc cần xử lý và thông báo đến hạn</p>
                            </div>
                        </div>

                        {houses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Bạn chưa quản lý nhà nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {houses.map((house) => {
                                    const pendingCount = house.pending_reminders_count || 0;

                                    return (
                                        <div
                                            key={house.id}
                                            onClick={() => handleFilterChange(selectedType, selectedStatus, house.id)}
                                            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>

                                            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                                <div>
                                                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                                        {house.type === 'apartment' ? 'Chung cư' : house.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                                    </span>
                                                    <h3 className="text-xl font-extrabold text-teal-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                                        {house.name}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                                <span className="text-xs text-gray-400 font-bold uppercase">Nhắc nhở cần xử lý:</span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${pendingCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${pendingCount > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                                                    {pendingCount} nhắc nhở
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* DRILL-DOWN HEADER */}
                        <div className="mb-6">
                            <button
                                onClick={() => handleFilterChange(selectedType, selectedStatus, 'all')}
                                className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors group"
                            >
                                <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách nhà
                            </button>

                            <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {selectedHouse.type === 'apartment' ? 'Chung cư' : selectedHouse.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-400 font-semibold">{reminders.total || 0} nhắc nhở tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <select
                                            value={selectedType}
                                            onChange={handleTypeChange}
                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
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
                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="pending">⚠️ Cần xử lý</option>
                                            <option value="upcoming">📅 Sắp tới</option>
                                            <option value="sent">✅ Đã gửi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REMINDERS TABLE LIST */}
                        {reminders.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Không có nhắc nhở nào cần xử lý ở nhà này.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày & Loại</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung nhắc nhở</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng & Khách thuê</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reminders.data.map((reminder) => {
                                            const typeConfig = getTypeConfig(reminder.type);
                                            const isOverdue = new Date(reminder.reminder_date) <= new Date() && !reminder.is_sent;
                                            const isSent = reminder.is_sent;

                                            return (
                                                <tr key={reminder.id} className="hover:bg-gray-50/70 transition-colors group">
                                                    {/* Trạng thái (Status Badge) */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isSent ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                                                Đã hoàn thành
                                                            </span>
                                                        ) : isOverdue ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                                                                Quá hạn xử lý
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                                                                Chưa xử lý
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Ngày & Loại */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 ${
                                                                isSent ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                                                                isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                            }`}>
                                                                <span className="text-sm leading-none font-black">{new Date(reminder.reminder_date).getDate()}</span>
                                                                <span className="text-[9px] opacity-75 font-semibold mt-0.5">T{new Date(reminder.reminder_date).getMonth() + 1}</span>
                                                            </div>
                                                            <div>
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${typeConfig.bg} ${typeConfig.text}`}>
                                                                    <span>{typeConfig.icon}</span> {typeConfig.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Nội dung */}
                                                    <td className="px-6 py-4">
                                                        <p className={`text-sm font-semibold leading-relaxed ${isSent ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                            {reminder.message || 'Không có nội dung'}
                                                        </p>
                                                    </td>

                                                    {/* Phòng & Khách thuê */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-xs font-medium">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg font-bold">
                                                                🏠 {reminder.contract?.room?.name ? (reminder.contract.room.name.toLowerCase().startsWith('phòng') ? reminder.contract.room.name : `Phòng ${reminder.contract.room.name}`) : 'N/A'}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-gray-700 font-semibold">
                                                                {reminder.contract?.renter_request?.name || 'Chưa rõ'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Thao tác */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {!isSent ? (
                                                                <button
                                                                    onClick={() => handleMarkAsSent(reminder.id)}
                                                                    className="p-2 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all hover:scale-110"
                                                                    title="Đánh dấu đã hoàn thành"
                                                                >
                                                                    {/* Check Circle Icon */}
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </button>
                                                            ) : (
                                                                <span className="p-2 rounded-lg text-emerald-500 cursor-default" title="Đã hoàn thành">
                                                                    {/* Check Circle Solid Icon */}
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                                                    </svg>
                                                                </span>
                                                            )}

                                                            <Link
                                                                href={route('landlord.reminders.show', reminder.id)}
                                                                className="p-2 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition-all hover:scale-110"
                                                                title="Xem chi tiết"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>

                                                            {canDeleteReminder && (
                                                                <button
                                                                    onClick={() => handleDelete(reminder.id)}
                                                                    className="p-2 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all hover:scale-110"
                                                                    title="Xóa"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {reminders.links && reminders.links.length > 3 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {reminders.links.map((link, index) => {
                                    // Parse url to make sure house_id query param is preserved
                                    let url = link.url;
                                    if (url && selectedHouse) {
                                        const urlObj = new URL(url, window.location.origin);
                                        urlObj.searchParams.set('house_id', selectedHouse.id);
                                        url = urlObj.pathname + urlObj.search;
                                    }
                                    return (
                                        <Link
                                            key={index}
                                            href={url || '#'}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${link.active
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : !link.url
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null })}
                onConfirm={executeDelete}
                title="Xóa nhắc nhở"
                message="Bạn có chắc muốn xóa nhắc nhở này?"
                confirmText="Xóa"
                type="danger"
            />
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;