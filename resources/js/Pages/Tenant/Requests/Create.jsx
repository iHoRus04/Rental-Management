import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function CreateTenantRequest({ auth, room, landlord }) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'maintenance',
        title: '',
        description: '',
        priority: 'medium',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tenant.requests.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tạo yêu cầu mới</h2>}
        >
            <Head title="Tạo yêu cầu mới" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Thông tin phòng */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-bold text-gray-700 mb-2">Thông tin phòng của bạn</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Phòng:</span>
                                        <span className="ml-2 font-medium">{room?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Chủ nhà:</span>
                                        <span className="ml-2 font-medium">{landlord?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Loại yêu cầu */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Loại yêu cầu <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="maintenance">Bảo trì / Sửa chữa</option>
                                        <option value="complaint">Khiếu nại</option>
                                        <option value="question">Câu hỏi</option>
                                        <option value="other">Khác</option>
                                    </select>
                                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                                </div>

                                {/* Mức độ ưu tiên */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Mức độ ưu tiên <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                        <option value="urgent">Khẩn cấp</option>
                                    </select>
                                    {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
                                </div>

                                {/* Tiêu đề */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ví dụ: Điều hòa không hoạt động"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Mô tả chi tiết <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                                        required
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                    <Link
                                        href={route('tenant.dashboard')}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
