import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function RenterRequestShow({ auth, renterRequest }) {
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'contacted':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'new':
                return 'Mới';
            case 'contacted':
                return 'Đã liên hệ';
            case 'approved':
                return 'Đã duyệt';
            case 'rejected':
                return 'Đã từ chối';
            default:
                return status;
        }
    };

    const updateStatus = (status) => {
        if (confirm('Bạn có chắc chắn muốn cập nhật trạng thái yêu cầu này?')) {
            router.post(route('landlord.renter-requests.update-status', { 
                request: renterRequest.id, 
                status: status 
            }), {}, {
                onSuccess: () => {
                    // Reload the page to show updated status
                    window.location.reload();
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chi tiết yêu cầu thuê phòng</h2>}
        >
            <Head title="Chi tiết yêu cầu thuê phòng" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <Link 
                                    href={route('landlord.renter-requests.index')} 
                                    className="inline-flex items-center text-blue-600 hover:text-blue-900"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Quay lại danh sách
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Thông tin người gửi */}
                                <div className="md:col-span-2">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin người gửi</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                                <p className="mt-1 text-sm text-gray-900">{renterRequest.name}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    <a href={`tel:${renterRequest.phone}`} className="text-blue-600 hover:text-blue-900">
                                                        {renterRequest.phone}
                                                    </a>
                                                </p>
                                            </div>
                                            
                                            {renterRequest.email && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        <a href={`mailto:${renterRequest.email}`} className="text-blue-600 hover:text-blue-900">
                                                            {renterRequest.email}
                                                        </a>
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {renterRequest.message && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Tin nhắn</label>
                                                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{renterRequest.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin phòng và hành động */}
                                <div>
                                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin phòng</h3>
                                        
                                        {renterRequest.room ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Tên phòng</label>
                                                    <p className="mt-1 text-sm text-gray-900">{renterRequest.room.name}</p>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Giá thuê</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {renterRequest.room.price ? 
                                                            new Intl.NumberFormat('vi-VN').format(renterRequest.room.price) + ' đ/tháng' : 
                                                            'Liên hệ'}
                                                    </p>
                                                </div>
                                                
                                                {renterRequest.room.house && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Nhà</label>
                                                        <p className="mt-1 text-sm text-gray-900">{renterRequest.room.house.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Không có thông tin phòng</p>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
                                        
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(renterRequest.status)}`}>
                                                {getStatusText(renterRequest.status)}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => updateStatus('contacted')}
                                                className="w-full px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                            >
                                                Đánh dấu đã liên hệ
                                            </button>
                                            
                                            <button
                                                onClick={() => updateStatus('approved')}
                                                className="w-full px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Duyệt yêu cầu
                                            </button>
                                            
                                            <button
                                                onClick={() => updateStatus('rejected')}
                                                className="w-full px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Từ chối yêu cầu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Gửi lúc: {new Date(renterRequest.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}