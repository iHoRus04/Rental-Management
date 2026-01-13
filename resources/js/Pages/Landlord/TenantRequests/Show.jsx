import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function TenantRequestShow({ auth, request }) {

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

    const handleUpdateStatus = (status) => {
        if (confirm(`Xác nhận chuyển trạng thái sang "${getStatusBadge(status).label}"?`)) {
            router.post(route('landlord.tenant-requests.update-status', [request.id, status]));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Chi tiết yêu cầu</h2>
                    <Link
                        href={route('landlord.tenant-requests.index')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        ← Quay lại danh sách
                    </Link>
                </div>
            }
        >
            <Head title="Chi tiết yêu cầu" />
             {/* HEADER */}
                <div className="mb-8">
                    <Link 
                        href={route('landlord.tenant-requests.index')}
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách
                    </Link>
               
                </div>

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Request Info */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{request.title}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getPriorityBadge(request.priority).class}`}>
                                        {getPriorityBadge(request.priority).label}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getTypeBadge(request.type).class}`}>
                                        {getTypeBadge(request.type).label}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusBadge(request.status).class}`}>
                                        {getStatusBadge(request.status).label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Người gửi</p>
                                    <p className="font-medium text-gray-900">{request.tenant?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phòng</p>
                                    <p className="font-medium text-gray-900">{request.room?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ngày gửi</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(request.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                {request.responded_at && (
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày phản hồi</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(request.responded_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</h4>
                                <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
                            </div>

                            {request.landlord_response && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="text-sm font-bold text-blue-900 mb-2">Phản hồi của bạn</h4>
                                    <p className="text-blue-900 whitespace-pre-wrap">{request.landlord_response}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h4>
                            <div className="flex flex-wrap gap-3">
                                {request.status !== 'pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus('pending')}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                                    >
                                        Chờ xử lý
                                    </button>
                                )}
                                {request.status !== 'in_progress' && (
                                    <button
                                        onClick={() => handleUpdateStatus('in_progress')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                                    >
                                        Đang xử lý
                                    </button>
                                )}
                                {request.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleUpdateStatus('resolved')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                                    >
                                        Đã giải quyết
                                    </button>
                                )}
                                {request.status !== 'closed' && (
                                    <button
                                        onClick={() => handleUpdateStatus('closed')}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                                    >
                                        Đóng yêu cầu
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
