import React, { useState } from 'react';
import TenantLayout from '@/Layouts/TenantLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantRequestsIndex({ auth, requests = [] }) {
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

    const filteredRequests = filterStatus === 'all'
        ? requests
        : requests.filter(req => req.status === filterStatus);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
        closed: requests.filter(r => r.status === 'closed').length,
    };

    return (
        <TenantLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Yêu cầu & Sự cố phòng</h2>}
        >
            <Head title="Yêu cầu & Sự cố" />

            <div className="py-8 bg-emerald-50/20 min-h-screen font-sans">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">Danh sách yêu cầu của bạn</h1>
                            <p className="text-gray-500 text-sm mt-1">Theo dõi tiến độ tiếp nhận, xử lý và sửa chữa các sự cố trong phòng trọ</p>
                        </div>
                        <Link
                            href={route('tenant.requests.create')}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/15 hover:shadow-emerald-700/20 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Tạo yêu cầu mới
                        </Link>
                    </div>

                    {/* Stats boxes */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                            <p className="text-2xl font-extrabold text-teal-950">{stats.total}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">Tổng yêu cầu</p>
                        </div>
                        <div className="bg-yellow-50/50 rounded-xl shadow-sm border border-yellow-100 p-4 text-center">
                            <p className="text-2xl font-extrabold text-yellow-600">{stats.pending}</p>
                            <p className="text-[10px] text-yellow-600 mt-1 uppercase font-bold tracking-wide">Chờ tiếp nhận</p>
                        </div>
                        <div className="bg-blue-50/50 rounded-xl shadow-sm border border-blue-100 p-4 text-center">
                            <p className="text-2xl font-extrabold text-blue-600">{stats.in_progress}</p>
                            <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-wide">Đang sửa chữa</p>
                        </div>
                        <div className="bg-green-50/50 rounded-xl shadow-sm border border-green-100 p-4 text-center">
                            <p className="text-2xl font-extrabold text-green-600">{stats.resolved}</p>
                            <p className="text-[10px] text-green-600 mt-1 uppercase font-bold tracking-wide">Đã sửa xong</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 text-center col-span-2 md:col-span-1">
                            <p className="text-2xl font-extrabold text-gray-600">{stats.closed}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">Đã đóng phiếu</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-full md:w-auto overflow-x-auto">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'all'
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Tất cả ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'pending'
                                    ? 'bg-white text-yellow-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Chờ xử lý ({stats.pending})
                            </button>
                            <button
                                onClick={() => setFilterStatus('in_progress')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'in_progress'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Đang xử lý ({stats.in_progress})
                            </button>
                            <button
                                onClick={() => setFilterStatus('resolved')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'resolved'
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Đã sửa xong ({stats.resolved})
                            </button>
                            <button
                                onClick={() => setFilterStatus('closed')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'closed'
                                    ? 'bg-white text-gray-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Đã đóng ({stats.closed})
                            </button>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="space-y-4">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <Link
                                    key={request.id}
                                    href={route('tenant.requests.show', request.id)}
                                    className="block p-5 sm:p-6 bg-white border border-gray-100 rounded-2xl hover:bg-emerald-50/5 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate hover:text-emerald-700 transition-colors">
                                                {request.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                                    🏠 Phòng {request.room?.name}
                                                </span>
                                                <span>•</span>
                                                <span>Ngày gửi: {new Date(request.created_at).toLocaleDateString('vi-VN')}</span>
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

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {request.description}
                                    </p>

                                    {request.assigned_to && (
                                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                            <span>
                                                Kỹ thuật viên phụ trách: <strong className="text-teal-900 font-bold">{request.assigned_to_name || 'Nhân viên A'}</strong>
                                            </span>
                                            {request.status === 'resolved' && (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                    Chờ bạn xác nhận nghiệm thu
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-500 font-bold">Không tìm thấy yêu cầu nào.</p>
                                <p className="text-xs text-gray-400 mt-1">Hãy bấm nút "Tạo yêu cầu mới" ở trên để báo cáo sự cố phòng trọ.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TenantLayout>
    );
}
