import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantRequestsIndex({ auth, requests = [], houses = [] }) {
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-700' },
            in_progress: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700' },
            resolved: { label: 'Đã giải quyết', class: 'bg-green-100 text-green-700' },
            closed: { label: 'Đã đóng', class: 'bg-gray-100 text-gray-700' },
        };
        return statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    };

    const getTypeBadge = (type) => {
        const typeMap = {
            maintenance: { label: 'Bảo trì', class: 'bg-orange-100 text-orange-700' },
            complaint: { label: 'Khiếu nại', class: 'bg-red-100 text-red-700' },
            question: { label: 'Câu hỏi', class: 'bg-purple-100 text-purple-700' },
            other: { label: 'Khác', class: 'bg-gray-100 text-gray-700' },
        };
        return typeMap[type] || { label: type, class: 'bg-gray-100 text-gray-700' };
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            low: { label: 'Thấp', class: 'bg-gray-100 text-gray-700' },
            medium: { label: 'Trung bình', class: 'bg-blue-100 text-blue-700' },
            high: { label: 'Cao', class: 'bg-orange-100 text-orange-700' },
            urgent: { label: 'Khẩn cấp', class: 'bg-red-100 text-red-700' },
        };
        return priorityMap[priority] || { label: priority, class: 'bg-gray-100 text-gray-700' };
    };

    // Calculate house statistics
    const getHouseStats = (houseId) => {
        const houseReqs = requests.filter(r => r.room && r.room.house_id === houseId);
        const total = houseReqs.length;
        const pending = houseReqs.filter(r => r.status === 'pending').length;
        const resolved = houseReqs.filter(r => r.status === 'resolved').length;
        return { total, pending, resolved };
    };

    // Filter logic for selected house
    const houseRequests = selectedHouse
        ? requests.filter(r => r.room && r.room.house_id === selectedHouse.id)
        : [];

    const filteredRequests = filterStatus === 'all'
        ? houseRequests
        : houseRequests.filter(req => req.status === filterStatus);

    const houseStats = {
        total: houseRequests.length,
        pending: houseRequests.filter(r => r.status === 'pending').length,
        in_progress: houseRequests.filter(r => r.status === 'in_progress').length,
        resolved: houseRequests.filter(r => r.status === 'resolved').length,
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Yêu cầu từ người thuê" />

            <div className="max-w-[1400px] mx-auto">

                {/* HOUSE LIST GRID VIEW */}
                {!selectedHouse ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Hộp thư hỗ trợ
                                </p>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Yêu cầu từ người thuê</h1>
                                <p className="text-gray-500 mt-1 text-sm">Chọn nhà trọ/căn hộ để xem các phản hồi và yêu cầu hỗ trợ từ người thuê</p>
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
                                    const { total, pending, resolved } = getHouseStats(house.id);

                                    return (
                                        <div
                                            key={house.id}
                                            onClick={() => setSelectedHouse(house)}
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
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                                <span className="text-xs text-gray-400 font-bold uppercase">Chờ xử lý:</span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${pending > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${pending > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                                                    {pending} chờ xử lý / {total} tổng
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
                                onClick={() => {
                                    setSelectedHouse(null);
                                    setFilterStatus('all');
                                }}
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
                                            <span className="text-xs text-gray-400 font-semibold">{houseRequests.length} yêu cầu tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* TABS */}
                        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-full md:w-auto overflow-x-auto">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'all'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Tất cả ({houseStats.total})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'pending'
                                        ? 'bg-white text-yellow-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Chờ xử lý ({houseStats.pending})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('in_progress')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'in_progress'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Đang xử lý ({houseStats.in_progress})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('resolved')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'resolved'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Đã giải quyết ({houseStats.resolved})
                                </button>
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="space-y-4">
                            {filteredRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredRequests.map((request) => (
                                        <Link
                                            key={request.id}
                                            href={route('landlord.tenant-requests.show', request.id)}
                                            className="block p-6 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50/50 hover:border-emerald-200 shadow-sm hover:shadow-md transition duration-300"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                                        {request.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">👤 {request.tenant?.name}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">🏠 Phòng {request.room?.name}</span>
                                                        {request.assigned_to && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1 text-emerald-700 font-medium">🔧 {request.assigned_to?.name}</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>📅 {new Date(request.created_at).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 ml-4">
                                                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded ${getPriorityBadge(request.priority).class}`}>
                                                        {getPriorityBadge(request.priority).label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded ${getTypeBadge(request.type).class}`}>
                                                        {getTypeBadge(request.type).label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded ${getStatusBadge(request.status).class}`}>
                                                        {getStatusBadge(request.status).label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {request.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">Chưa có yêu cầu nào.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

TenantRequestsIndex.layout = (page) => <AuthenticatedLayout children={page} />;
