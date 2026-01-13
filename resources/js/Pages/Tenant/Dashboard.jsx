import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantDashboard({ auth, contract, room, landlord, recentRequests, requestsStats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Người Thuê</h2>}
        >
            <Head title="Dashboard Người Thuê" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Thông tin hợp đồng */}
                        {contract && room && landlord ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin phòng trọ của bạn</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nhà trọ</p>
                                        <p className="text-base font-medium text-gray-900">{room.house.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Phòng</p>
                                        <p className="text-base font-medium text-gray-900">{room.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Giá thuê</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.monthly_rent)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Chủ nhà</p>
                                        <p className="text-base font-medium text-gray-900">{landlord.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                                        <p className="text-base font-medium text-gray-900">{contract.start_date}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Ngày kết thúc</p>
                                        <p className="text-base font-medium text-gray-900">{contract.end_date || 'Không xác định'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <p className="text-yellow-800">Bạn chưa có hợp đồng thuê phòng nào đang hoạt động.</p>
                            </div>
                        )}

                        {/* Thống kê yêu cầu */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-yellow-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-yellow-600">{requestsStats.pending}</p>
                                    <p className="text-sm text-gray-600 mt-2">Yêu cầu đang chờ</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{requestsStats.in_progress}</p>
                                    <p className="text-sm text-gray-600 mt-2">Đang xử lý</p>
                                </div>
                            </div>

                            <div className="bg-green-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">{requestsStats.resolved}</p>
                                    <p className="text-sm text-gray-600 mt-2">Đã giải quyết</p>
                                </div>
                            </div>
                        </div>

                        {/* Nút tạo yêu cầu mới */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Yêu cầu / Báo cáo</h3>
                                <Link
                                    href={route('tenant.requests.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Tạo yêu cầu mới
                                </Link>
                            </div>
                        </div>

                        {/* Yêu cầu gần đây */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Yêu cầu gần đây</h3>
                                
                                {recentRequests && recentRequests.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentRequests.map((request) => (
                                            <Link
                                                key={request.id}
                                                href={route('tenant.requests.show', request.id)}
                                                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.title}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{request.type}</p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        request.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {request.status === 'pending' ? 'Chờ xử lý' :
                                                         request.status === 'in_progress' ? 'Đang xử lý' :
                                                         request.status === 'resolved' ? 'Đã giải quyết' :
                                                         request.status === 'closed' ? 'Đã đóng' : request.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Chưa có yêu cầu nào.</p>
                                )}

                                {recentRequests && recentRequests.length > 0 && (
                                    <div className="mt-4">
                                        <Link
                                            href={route('tenant.requests.index')}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Xem tất cả yêu cầu →
                                        </Link>
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
