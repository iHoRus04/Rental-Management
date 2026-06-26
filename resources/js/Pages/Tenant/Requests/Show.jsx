import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function TenantRequestShow({ auth, request }) {
    const [showRejectForm, setShowRejectForm] = useState(false);

    const rejectForm = useForm({
        reject_reason: '',
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
            in_progress: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
            resolved: { label: 'Đã giải quyết', class: 'bg-green-100 text-green-700 border border-green-200 animate-pulse' },
            closed: { label: 'Đã đóng', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
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

    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `/storage/${path}`;
    };

    const isVideo = (path) => {
        if (!path) return false;
        const ext = path.split('.').pop().toLowerCase();
        return ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext);
    };

    const handleConfirmClose = () => {
        if (confirm('Bạn có chắc chắn muốn xác nhận hoàn tất sửa chữa và đóng yêu cầu này không?')) {
            router.post(route('tenant.requests.close', request.id));
        }
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectForm.data.reject_reason.trim()) {
            alert('Vui lòng nhập lý do từ chối nghiệm thu.');
            return;
        }
        rejectForm.post(route('tenant.requests.reject', request.id), {
            onSuccess: () => {
                setShowRejectForm(false);
                rejectForm.reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Chi tiết yêu cầu</h2>
                    <Link
                        href={route('tenant.requests.index')}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition flex items-center gap-1"
                    >
                        ← Quay lại danh sách
                    </Link>
                </div>
            }
        >
            <Head title="Chi tiết yêu cầu" />

            <div className="py-8 bg-emerald-50/20 min-h-screen font-sans">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Status notification for action needed */}
                    {request.status === 'resolved' && !showRejectForm && (
                        <div className="p-5 bg-emerald-100/90 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                            <div>
                                <h4 className="text-emerald-950 font-extrabold text-base">Sự cố đã được sửa chữa xong!</h4>
                                <p className="text-emerald-800 text-xs mt-0.5">Vui lòng kiểm tra lại phòng trọ/thiết bị của bạn.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 bg-white rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                                >
                                    Yêu cầu sửa lại
                                </button>
                                <button
                                    onClick={handleConfirmClose}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-emerald-600/15 hover:shadow-emerald-700/20 transition-all whitespace-nowrap"
                                >
                                    Xác nhận hoàn tất
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reject Reason Form Inline */}
                    {showRejectForm && (
                        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl shadow-sm space-y-4">
                            <div>
                                <h4 className="text-rose-950 font-extrabold text-base">Từ chối nghiệm thu & Yêu cầu sửa lại</h4>
                                <p className="text-rose-800 text-xs mt-0.5">Vui lòng ghi rõ lý do hoặc các điểm chưa hài lòng để kỹ thuật viên nắm rõ.</p>
                            </div>
                            
                            <form onSubmit={handleRejectSubmit} className="space-y-4">
                                <textarea
                                    value={rejectForm.data.reject_reason}
                                    onChange={(e) => rejectForm.setData('reject_reason', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                                    placeholder="Ví dụ: Máy lạnh chạy được 10 phút lại ngắt và chảy nước ra sàn nhà..."
                                    required
                                />
                                {rejectForm.errors.reject_reason && (
                                    <p className="text-xs text-red-600 font-bold">{rejectForm.errors.reject_reason}</p>
                                )}

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectForm(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-medium text-xs transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejectForm.processing}
                                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                                    >
                                        {rejectForm.processing ? 'Đang gửi...' : 'Gửi yêu cầu sửa lại'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm rounded-[24px] border border-gray-100 p-6 sm:p-8 space-y-8">
                        {/* Title and Badges */}
                        <div className="border-b border-gray-100 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h1 className="text-2xl font-extrabold text-teal-900 leading-snug">{request.title}</h1>
                                <div className="flex gap-2 self-start sm:self-auto flex-wrap">
                                    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg tracking-wider uppercase ${getPriorityBadge(request.priority).class}`}>
                                        {getPriorityBadge(request.priority).label}
                                    </span>
                                    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg tracking-wider uppercase ${getTypeBadge(request.type).class}`}>
                                        {getTypeBadge(request.type).label}
                                    </span>
                                    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg tracking-wider uppercase ${getStatusBadge(request.status).class}`}>
                                        {getStatusBadge(request.status).label}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                                <span>Phòng: <strong className="text-teal-950 font-bold">{request.room?.name} ({request.room?.house?.name})</strong></span>
                                <span className="text-gray-300">|</span>
                                <span>Người báo: <strong className="text-teal-950 font-bold">{auth.user.name}</strong></span>
                                <span className="text-gray-300">|</span>
                                <span>Gửi lúc: {new Date(request.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Chi tiết mô tả lỗi</h3>
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                                {request.description}
                            </div>
                        </div>

                        {/* Original images uploaded by tenant */}
                        {request.images && request.images.length > 0 && (
                            <div>
                                <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Ảnh / Video hiện trạng sự cố</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {request.images.map((path, idx) => (
                                        <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden aspect-square bg-gray-50 shadow-sm relative group">
                                            {isVideo(path) ? (
                                                <video 
                                                    src={getFileUrl(path)} 
                                                    controls 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <a href={getFileUrl(path)} target="_blank" rel="noreferrer">
                                                    <img 
                                                        src={getFileUrl(path)} 
                                                        alt="Hiện trạng lỗi" 
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Technician Assignment */}
                        {(request.assigned_to || request.status !== 'pending') && (
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Thông tin xử lý</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/10 p-5 rounded-2xl border border-emerald-100/50 text-sm">
                                    <div>
                                        <span className="text-gray-500">Người phụ trách:</span>
                                        <div className="font-bold text-teal-950 mt-0.5">
                                            {request.assigned_to ? request.assigned_to.name : 'Chủ nhà trọ'}
                                        </div>
                                    </div>
                                    {request.assigned_to?.phone && (
                                        <div>
                                            <span className="text-gray-500">Số điện thoại:</span>
                                            <div className="font-bold text-teal-950 mt-0.5">
                                                {request.assigned_to.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Resolution / Proof of Completion */}
                        {(request.status === 'resolved' || request.status === 'closed') && (
                            <div className="border-t border-gray-100 pt-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Kết quả khắc phục & Nghiệm thu</h3>
                                    
                                    {request.landlord_response && (
                                        <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-5 mb-4 text-sm text-gray-800">
                                            <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Ghi chú sửa chữa:</span>
                                            <p className="whitespace-pre-line leading-relaxed">{request.landlord_response}</p>
                                        </div>
                                    )}
                                </div>

                                {request.resolved_images && request.resolved_images.length > 0 && (
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Ảnh / Video nghiệm thu kết quả:</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {request.resolved_images.map((path, idx) => (
                                                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden aspect-square bg-gray-50 shadow-sm relative group">
                                                    {isVideo(path) ? (
                                                        <video 
                                                            src={getFileUrl(path)} 
                                                            controls 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <a href={getFileUrl(path)} target="_blank" rel="noreferrer" className="w-full h-full block">
                                                            <img 
                                                                src={getFileUrl(path)} 
                                                                alt="Nghiệm thu sự cố" 
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
