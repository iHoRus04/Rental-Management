import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function TenantRequestShow({ auth, request, staffMembers = [] }) {
    
    // Form for technician assignment
    const assignForm = useForm({
        assigned_to: request.assigned_to?.id || request.assigned_to || '',
    });

    // Form for resolving/completing repair (requires upload proof)
    const resolveForm = useForm({
        resolved_images: [],
        landlord_response: request.landlord_response || '',
    });

    const [resolvedPreviews, setResolvedPreviews] = useState([]);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ tiếp nhận', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
            in_progress: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
            resolved: { label: 'Đã giải quyết', class: 'bg-green-100 text-green-700 border border-green-200' },
            closed: { label: 'Đã đóng (Hoàn tất)', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
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

    // Step 2: Assign Technician
    const handleAssign = (e) => {
        e.preventDefault();
        if (!assignForm.data.assigned_to) {
            alert('Vui lòng chọn một kỹ thuật viên để phân công.');
            return;
        }
        assignForm.post(route('landlord.tenant-requests.assign', request.id), {
            onSuccess: () => {
                // Succesfully assigned
            }
        });
    };



    // Step 3: Upload resolution images and resolve ticket
    const handleResolveFileChange = (e) => {
        const files = Array.from(e.target.files);
        const limitedFiles = files.slice(0, 5);
        resolveForm.setData('resolved_images', limitedFiles);

        // Previews
        const previews = limitedFiles.map(file => {
            return {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2),
                type: file.type,
                url: URL.createObjectURL(file)
            };
        });
        setResolvedPreviews(previews);
    };

    const handleResolve = (e) => {
        e.preventDefault();
        if (resolveForm.data.resolved_images.length === 0) {
            alert('Bắt buộc phải tải lên hình ảnh/video kết quả sửa chữa để nghiệm thu.');
            return;
        }
        resolveForm.post(route('landlord.tenant-requests.resolve', request.id), {
            onSuccess: () => {
                setResolvedPreviews([]);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-teal-900 leading-tight">Chi tiết phiếu hỗ trợ</h2>
                    <Link
                        href={route('landlord.tenant-requests.index')}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition flex items-center gap-1"
                    >
                        ← Quay lại danh sách
                    </Link>
                </div>
            }
        >
            <Head title="Chi tiết phiếu yêu cầu" />

            <div className="min-h-screen bg-emerald-50/20 py-8 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Return link */}
                    <div>
                        <Link 
                            href={route('landlord.tenant-requests.index')}
                            className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-emerald-700 transition group mb-2"
                        >
                            <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại danh sách yêu cầu
                        </Link>
                    </div>

                    {/* Ticket Details Panel */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                        {/* Title and Badges */}
                        <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 flex-wrap">
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        🏠 Phòng {request.room?.name} ({request.room?.house?.name})
                                    </span>
                                    <span>•</span>
                                    <span>Gửi bởi: <strong className="text-teal-950 font-bold">{request.tenant?.name}</strong></span>
                                    <span>•</span>
                                    <span>{new Date(request.created_at).toLocaleString('vi-VN')}</span>
                                </div>
                                <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight leading-snug">
                                    {request.title}
                                </h1>
                            </div>
                            <div className="flex gap-2 self-start sm:self-auto">
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

                        {/* Request Description */}
                        <div>
                            <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Mô tả sự cố</h3>
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                                {request.description}
                            </div>
                        </div>

                        {/* Attachments from Tenant */}
                        {request.images && request.images.length > 0 && (
                            <div>
                                <h3 className="text-sm font-extrabold text-teal-950 mb-3 uppercase tracking-wider">Ảnh / Video hiện trạng đính kèm</h3>
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
                                                <a href={getFileUrl(path)} target="_blank" rel="noreferrer" className="w-full h-full block">
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
                    </div>

                    {/* Step 2 Panel: Assign Technician */}
                    {(request.status === 'pending' || request.status === 'in_progress') && (
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-teal-900">1. Điều phối người phụ trách sửa chữa</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Chọn người phụ trách sửa chữa sự cố vật lý. Phiếu yêu cầu sẽ tự động chuyển sang trạng thái Đang xử lý sau khi phân công.
                                </p>
                            </div>

                            <div className="p-5 bg-emerald-50/10 rounded-2xl border border-emerald-100/50">
                                <form onSubmit={handleAssign} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-bold text-emerald-950 mb-2">Chọn kỹ thuật viên / người phụ trách</label>
                                        <select
                                            value={assignForm.data.assigned_to}
                                            onChange={(e) => assignForm.setData('assigned_to', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                            disabled={staffMembers.length === 0}
                                        >
                                            <option value="">-- Chọn người phụ trách --</option>
                                            {staffMembers.map((staff) => (
                                                <option key={staff.id} value={staff.id}>
                                                    {staff.name} {staff.phone ? `(${staff.phone})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {staffMembers.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">Chưa có tài khoản nhân viên nào được gán cho nhà này.</p>
                                        )}
                                        {assignForm.errors.assigned_to && (
                                            <p className="text-xs text-red-500 mt-1">{assignForm.errors.assigned_to}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={assignForm.processing || staffMembers.length === 0}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20"
                                    >
                                        {assignForm.processing ? 'Đang phân công...' : 'Xác nhận phân công'}
                                    </button>
                                </form>
                            </div>

                            {request.assigned_to && (
                                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                                    <span>
                                        🔧 Đang phân công cho kỹ thuật viên: <strong className="font-bold text-sm text-teal-900">{request.assigned_to.name}</strong>
                                    </span>
                                    {request.assigned_to.phone && (
                                        <span>📞 SĐT: <strong className="font-bold">{request.assigned_to.phone}</strong></span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3 Panel: Sửa chữa và Nghiệm thu thực tế (Only when in_progress or resolved/closed) */}
                    {request.status === 'in_progress' ? (
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-teal-900">2. Sửa chữa và Nghiệm thu thực tế</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Sau khi kỹ thuật viên khắc phục xong sự cố vật lý, họ <strong className="font-bold">bắt buộc phải tải ảnh/video nghiệm thu kết quả đã sửa xong</strong> để chuyển trạng thái sang Đã hoàn thành (resolved).
                                </p>
                            </div>

                            <form onSubmit={handleResolve} className="space-y-6">
                                {/* Response notes */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ghi chú kết quả sửa chữa / Vật tư thay thế
                                    </label>
                                    <textarea
                                        value={resolveForm.data.landlord_response}
                                        onChange={(e) => resolveForm.setData('landlord_response', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                        placeholder="Ghi chú chi tiết kết quả xử lý (VD: Đã hàn ống nước bị vỡ, đã nạp gas điều hòa hết 250k...)"
                                    />
                                    {resolveForm.errors.landlord_response && (
                                        <p className="text-xs text-red-500 mt-1">{resolveForm.errors.landlord_response}</p>
                                    )}
                                </div>

                                {/* Upload resolved images */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ảnh / Video kết quả sau khi sửa xong <span className="text-red-500">*</span>
                                    </label>

                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 transition-all cursor-pointer relative bg-gray-50/50 hover:bg-emerald-50/10">
                                        <div className="space-y-2 text-center">
                                            <div className="mx-auto h-10 w-10 text-gray-400 flex items-center justify-center">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="resolve-file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-emerald-600 hover:text-emerald-700 focus-within:outline-none">
                                                    <span>Chụp ảnh / Tải tệp lên</span>
                                                    <input 
                                                        id="resolve-file-upload" 
                                                        name="resolved_images[]" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        multiple 
                                                        accept="image/*,video/*" 
                                                        onChange={handleResolveFileChange}
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1 text-gray-500">để đính kèm</p>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Tải lên tối đa 5 hình ảnh hoặc video nghiệm thu (dung lượng dưới 10MB mỗi tệp)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Previews of resolved images */}
                                    {resolvedPreviews.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 mb-2">Tệp nghiệm thu đã chọn ({resolvedPreviews.length}/5):</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                                {resolvedPreviews.map((file, idx) => (
                                                    <div key={idx} className="relative border rounded-xl overflow-hidden aspect-square bg-gray-50 flex flex-col justify-between p-1">
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
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {resolveForm.errors.resolved_images && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">{resolveForm.errors.resolved_images}</p>
                                    )}
                                    {Object.keys(resolveForm.errors).filter(key => key.startsWith('resolved_images.')).map((key) => (
                                        <p key={key} className="text-xs text-red-500 mt-1 font-medium">{resolveForm.errors[key]}</p>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={resolveForm.processing}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {resolveForm.processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                            Đang lưu nghiệm thu...
                                        </>
                                    ) : 'Hoàn thành sửa chữa (Chuyển Resolved)'}
                                </button>
                            </form>
                        </div>
                    ) : null}

                    {/* Step 3 & 4 logs: Show resolution details when resolved or closed */}
                    {(request.status === 'resolved' || request.status === 'closed') && (
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-teal-900">
                                    {request.status === 'closed' ? '3. Nhật ký sửa chữa & Nghiệm thu (Đã đóng)' : '3. Nghiệm thu kỹ thuật và Chờ khách thuê đóng phiếu'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {request.status === 'closed' 
                                        ? 'Khách thuê đã kiểm tra thiết bị và bấm nút Xác nhận hoàn tất để đóng phiếu.'
                                        : 'Kỹ thuật viên đã sửa chữa xong sự cố vật lý. Khách thuê đã được thông báo để kiểm tra và nghiệm thu đóng phiếu.'}
                                </p>
                            </div>

                            {request.landlord_response && (
                                <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-5 text-sm">
                                    <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Ghi chú kết quả sửa chữa:</span>
                                    <p className="text-teal-950 font-medium whitespace-pre-line leading-relaxed">{request.landlord_response}</p>
                                </div>
                            )}

                            {request.resolved_images && request.resolved_images.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Ảnh / Video nghiệm thu:</span>
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
        </AuthenticatedLayout>
    );
}
