import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function CreateTenantRequest({ auth, room, landlord }) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'maintenance',
        title: '',
        description: '',
        priority: 'medium',
        images: [],
    });

    const [selectedFilesPreview, setSelectedFilesPreview] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Limit to 5 files
        const limitedFiles = files.slice(0, 5);
        setData('images', limitedFiles);

        // Generate previews
        const previews = limitedFiles.map(file => {
            return {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2),
                type: file.type,
                url: URL.createObjectURL(file)
            };
        });
        setSelectedFilesPreview(previews);
    };

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

            <div className="py-12 bg-emerald-50/20 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-[24px] border border-gray-100">
                        <div className="p-6 sm:p-8">
                            {/* Thông tin phòng */}
                            <div className="mb-6 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-1">Thông tin phòng thuê</h3>
                                    <div className="flex gap-4 text-sm text-emerald-950 font-medium">
                                        <div>Phòng: <span className="font-bold text-teal-900">{room?.name}</span></div>
                                        <div className="text-emerald-300">|</div>
                                        <div>Chủ nhà: <span className="font-bold text-teal-900">{landlord?.name}</span></div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Loại yêu cầu */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Loại yêu cầu <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            required
                                        >
                                            <option value="low">Thấp</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="high">Cao</option>
                                            <option value="urgent">Khẩn cấp</option>
                                        </select>
                                        {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
                                    </div>
                                </div>

                                {/* Tiêu đề */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Tiêu đề yêu cầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="Ví dụ: Hỏng vòi nước nhà vệ sinh, Máy lạnh không lạnh..."
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Mô tả chi tiết sự cố <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="Mô tả cụ thể sự cố (VD: Vị trí hư hỏng, biểu hiện thế nào, bị từ khi nào...)"
                                        required
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                {/* Đính kèm ảnh/video hiện trạng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ảnh / Video hiện trạng sự cố (Không bắt buộc)
                                    </label>
                                    
                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 focus-within:border-emerald-500 transition-all cursor-pointer relative bg-gray-50/50 hover:bg-emerald-50/10">
                                        <div className="space-y-2 text-center">
                                            <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-emerald-600 hover:text-emerald-700 focus-within:outline-none">
                                                    <span>Chụp ảnh / Chọn tệp tin</span>
                                                    <input 
                                                        id="file-upload" 
                                                        name="images[]" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        multiple 
                                                        accept="image/*,video/*" 
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                <p className="pl-1 text-gray-500">để đính kèm</p>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Được chọn tối đa 5 hình ảnh hoặc video (dung lượng dưới 10MB mỗi tệp)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preview selected files */}
                                    {selectedFilesPreview.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 mb-2">Tệp đã chọn ({selectedFilesPreview.length}/5):</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                                {selectedFilesPreview.map((file, idx) => (
                                                    <div key={idx} className="relative group border rounded-xl overflow-hidden aspect-square bg-gray-50 flex flex-col justify-between p-1.5">
                                                        {file.type.startsWith('image/') ? (
                                                            <img 
                                                                src={file.url} 
                                                                alt={file.name} 
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-teal-50 text-teal-600 rounded-lg">
                                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                <span className="text-[10px] mt-1 font-bold">VIDEO</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                                                            <span className="text-[10px] text-white font-medium truncate w-full">{file.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {errors.images && <p className="mt-1 text-sm text-red-600 font-medium">{errors.images}</p>}
                                    {Object.keys(errors).filter(key => key.startsWith('images.')).map((key) => (
                                        <p key={key} className="mt-1 text-sm text-red-600 font-medium">{errors[key]}</p>
                                    ))}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                                    <Link
                                        href={route('tenant.dashboard')}
                                        className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
                                    >
                                        Hủy bỏ
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-600/15 hover:shadow-emerald-700/20"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                Đang gửi yêu cầu...
                                            </>
                                        ) : 'Gửi yêu cầu bảo trì'}
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
