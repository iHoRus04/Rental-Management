import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ feedbacks }) {
    const { systemSettings } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        type: 'suggestion',
        image: null,
        remove_image: 'false',
        _method: 'post'
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                image: file,
                remove_image: 'false'
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setData((prev) => ({
            ...prev,
            image: null,
            remove_image: 'true'
        }));
        setImagePreview(null);
        if (document.getElementById('feedback-image')) {
            document.getElementById('feedback-image').value = '';
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (fb, e) => {
        e.stopPropagation(); // Ngăn hành vi expand dòng khi bấm sửa
        setEditingId(fb.id);
        setData({
            title: fb.title,
            content: fb.content,
            type: fb.type,
            image: null,
            remove_image: 'false',
            _method: 'put'
        });
        if (fb.image) {
            setImagePreview(fb.image);
        } else {
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
        setImagePreview(null);
    };

    const handleDeleteClick = (id, e) => {
        e.stopPropagation(); // Ngăn hành vi expand dòng khi bấm xóa
        setConfirmDelete({ show: true, id });
    };

    const executeDelete = () => {
        router.delete(route('landlord.feedbacks.destroy', confirmDelete.id), {
            preserveScroll: true,
            onFinish: () => setConfirmDelete({ show: false, id: null }),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            post(route('landlord.feedbacks.update', editingId), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post(route('landlord.feedbacks.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 font-sans min-h-screen">
            <Head title="Góp ý & Phản hồi" />

            {/* HEADER tối giản */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Góp ý & Phản hồi</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Quản lý và gửi góp ý, báo cáo lỗi phần mềm đến Ban quản trị.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                    <span>+</span> Gửi góp ý mới
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Cột trái: Danh sách phản hồi */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {feedbacks.length === 0 ? (
                            <div className="p-16 text-center text-slate-400 text-sm font-medium">
                                Bạn chưa gửi ý kiến phản hồi nào.
                            </div>
                        ) : (
                            feedbacks.map((fb) => {
                                const isExpanded = expandedId === fb.id;
                                return (
                                    <div key={fb.id} className="transition-all hover:bg-slate-50/40">
                                        {/* Dòng rút gọn */}
                                        <div
                                            onClick={() => toggleExpand(fb.id)}
                                            className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                                {/* Icon Phân loại nhỏ gọn */}
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 ${fb.type === 'bug'
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                        : fb.type === 'support'
                                                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    }`}>
                                                    {fb.type === 'bug' ? 'Lỗi' : fb.type === 'support' ? 'Hỗ trợ' : 'Góp ý'}
                                                </span>

                                                <span className="font-bold text-slate-700 text-sm truncate hover:text-slate-900">
                                                    {fb.title}
                                                </span>

                                                {!isExpanded && (
                                                    <span className="text-slate-400 text-xs truncate max-w-[280px] hidden md:inline font-medium">
                                                        - {fb.content}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto text-xs font-semibold text-slate-400">
                                                <span>{fb.created_at}</span>

                                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider ${fb.status === 'processed'
                                                        ? 'bg-slate-100 text-slate-500'
                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {fb.status === 'processed' ? 'Đã xử lý' : 'Đang xử lý'}
                                                </span>

                                                {fb.status === 'pending' && (
                                                    <div className="flex gap-2 text-xs font-bold shrink-0">
                                                        <button
                                                            onClick={(e) => openEditModal(fb, e)}
                                                            className="text-emerald-600 hover:text-emerald-800 transition-colors"
                                                        >
                                                            Sửa
                                                        </button>
                                                        <span className="text-slate-200">|</span>
                                                        <button
                                                            onClick={(e) => handleDeleteClick(fb.id, e)}
                                                            className="text-rose-500 hover:text-rose-700 transition-colors"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                )}

                                                <svg className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>

                                        {/* Khối chi tiết mở rộng */}
                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-1 sm:px-14 sm:pb-6 space-y-4 bg-slate-50/20 border-t border-slate-50">
                                                <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed font-medium">
                                                    {fb.content}
                                                </p>

                                                {fb.image && (
                                                    <div className="relative max-w-[200px] rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm group">
                                                        <a href={fb.image} target="_blank" rel="noopener noreferrer" className="block relative">
                                                            <img src={fb.image} alt="Đính kèm" className="w-full h-auto max-h-32 object-cover hover:scale-105 transition-transform duration-200" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Cột phải: Thẻ liên hệ hỗ trợ kỹ thuật */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 sticky top-24">
                        <div className="border-b border-slate-50 pb-4">
                            <h3 className="text-sm font-extrabold text-slate-800">Trung tâm Hỗ trợ</h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Liên hệ trực tiếp với bộ phận chăm sóc khách hàng.</p>
                        </div>

                        {/* Hotline */}
                        <div className="space-y-1.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng đài hỗ trợ</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <a href={`tel:${systemSettings?.support_phone}`} className="text-sm font-black text-slate-800 hover:text-emerald-600 transition-colors">
                                    {systemSettings?.support_phone || '0987654321'}
                                </a>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email hỗ trợ kỹ thuật</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <a href={`mailto:${systemSettings?.support_email}`} className="text-xs font-bold text-slate-700 hover:text-teal-600 transition-colors truncate">
                                    {systemSettings?.support_email || 'support@dreamhouses.vn'}
                                </a>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Văn phòng giao dịch</span>
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <p className="text-[11px] font-medium text-slate-500 leading-normal">
                                    {systemSettings?.support_address || '123 Đường Láng, Đống Đa, Hà Nội'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-50 pt-4 text-[10px] text-slate-400 font-medium leading-normal text-center">
                            Chúng tôi luôn sẵn sàng đồng hành hỗ trợ bạn quản lý nhà trọ chuyên nghiệp hơn.
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL SOẠN THẢO/CHỈNH SỬA TỐI GIẢN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[500px] rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold"
                        >
                            ✕
                        </button>

                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? '✍️ Chỉnh sửa góp ý' : '✏️ Tạo góp ý & báo lỗi'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Ý kiến của bạn giúp hệ thống DreamHouses hoàn thiện hơn.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    placeholder="Nhập tiêu đề ngắn gọn..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all"
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân loại *</label>
                                <select
                                    value={data.type}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all cursor-pointer"
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    <option value="suggestion">💡 Đóng góp ý kiến</option>
                                    <option value="bug">🐛 Báo cáo lỗi phần mềm</option>
                                    <option value="support">📞 Yêu cầu hỗ trợ kỹ thuật</option>
                                </select>
                                {errors.type && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nội dung chi tiết *</label>
                                <textarea
                                    value={data.content}
                                    rows="4"
                                    placeholder="Mô tả cụ thể sự cố hoặc đóng góp ý kiến..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-medium transition-all resize-none"
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                ></textarea>
                                {errors.content && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.content}</p>}
                            </div>

                            {/* Upload ảnh đính kèm */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hình ảnh đính kèm</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="feedback-image"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="feedback-image"
                                        className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed hover:border-emerald-500 text-xs text-slate-500 font-bold cursor-pointer transition-all flex items-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Chọn ảnh
                                    </label>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="text-xs text-rose-500 font-bold hover:text-rose-700"
                                        >
                                            Xóa ảnh
                                        </button>
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="mt-2.5 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                                        <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                                    </div>
                                )}
                                {errors.image && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.image}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-all active:scale-[0.98]"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]"
                                >
                                    {editingId ? 'Lưu thay đổi' : 'Gửi đi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null })}
                onConfirm={executeDelete}
                title="Xóa phản hồi"
                message="Bạn có chắc chắn muốn xóa phản hồi này không?"
                confirmText="Xóa"
                type="danger"
            />
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;
