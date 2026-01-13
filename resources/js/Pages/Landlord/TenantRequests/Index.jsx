import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantRequestsIndex({ auth, requests }) {
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredRequests = filterStatus === 'all' 
        ? requests 
        : requests.filter(req => req.status === filterStatus);

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

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Yêu cầu từ người thuê</h2>}
        >
            <Head title="Yêu cầu từ người thuê" />

            
            

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm text-gray-600 mt-2">Tổng yêu cầu</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                    <p className="text-sm text-gray-600 mt-2">Chờ xử lý</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
                                    <p className="text-sm text-gray-600 mt-2">Đang xử lý</p>
                                </div>
                            </div>

                            <div className="bg-green-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                                    <p className="text-sm text-gray-600 mt-2">Đã giải quyết</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filterStatus === 'all' 
                                            ? 'bg-gray-900 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả ({stats.total})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filterStatus === 'pending' 
                                            ? 'bg-yellow-600 text-white' 
                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    }`}
                                >
                                    Chờ xử lý ({stats.pending})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('in_progress')}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filterStatus === 'in_progress' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                >
                                    Đang xử lý ({stats.in_progress})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('resolved')}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filterStatus === 'resolved' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    Đã giải quyết ({stats.resolved})
                                </button>
                            </div>
                        </div>

                        {/* Requests List */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {filteredRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredRequests.map((request) => (
                                            <Link
                                                key={request.id}
                                                href={route('landlord.tenant-requests.show', request.id)}
                                                className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                            {request.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span>{request.tenant?.name}</span>
                                                            <span className="mx-2">•</span>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                            </svg>
                                                            <span>{request.room?.name}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{new Date(request.created_at).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getPriorityBadge(request.priority).class}`}>
                                                            {getPriorityBadge(request.priority).label}
                                                        </span>
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getTypeBadge(request.type).class}`}>
                                                            {getTypeBadge(request.type).label}
                                                        </span>
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadge(request.status).class}`}>
                                                            {getStatusBadge(request.status).label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {request.description}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">Chưa có yêu cầu nào</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {filterStatus === 'all' 
                                                ? 'Chưa có người thuê nào gửi yêu cầu.' 
                                                : `Không có yêu cầu nào ở trạng thái "${getStatusBadge(filterStatus).label}".`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
