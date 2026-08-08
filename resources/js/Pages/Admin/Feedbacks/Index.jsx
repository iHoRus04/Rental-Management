import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ feedbacks }) {
    const [expandedId, setExpandedId] = useState(null);

    const handleMarkProcessed = (feedbackId, e) => {
        e.stopPropagation(); // Ngăn hành vi expand dòng khi click nút xử lý
        router.put(route('admin.feedbacks.update', feedbackId), {
            status: 'processed'
        }, {
            preserveScroll: true
        });
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <AdminLayout title="Quản lý Góp ý & Phản hồi">
            <Head title="Quản lý Góp ý & Phản hồi" />

            <div className="space-y-6 max-w-[1400px] mx-auto font-sans min-h-screen pb-8">
                {/* Stats Bar tối giản */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">📥 Quản lý Phản hồi</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Tiếp nhận góp ý, hỗ trợ kỹ thuật và báo cáo sự cố từ các chủ trọ.</p>
                    </div>

                    <div className="flex gap-2 text-xs font-bold w-full sm:w-auto">
                        <span className="px-3.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100/50">
                            ⏳ Chờ: {feedbacks.filter(fb => fb.status === 'pending').length}
                        </span>
                        <span className="px-3.5 py-1.5 bg-slate-100 text-slate-500 rounded-lg">
                            ✅ Xử lý: {feedbacks.filter(fb => fb.status === 'processed').length}
                        </span>
                    </div>
                </div>

                {/* Danh sách phản hồi dạng dòng */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {feedbacks.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 text-sm font-medium">
                            Chưa nhận được phản hồi nào từ hệ thống.
                        </div>
                    ) : (
                        feedbacks.map((fb) => {
                            const isExpanded = expandedId === fb.id;
                            return (
                                <div key={fb.id} className="transition-all hover:bg-slate-50/40">
                                    {/* Dòng rút gọn */}
                                    <div
                                        onClick={() => toggleExpand(fb.id)}
                                        className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer select-none"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto overflow-hidden">
                                            {/* Avatar chữ cái đầu mỏng nhẹ */}
                                            <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                                                {fb.sender.name.charAt(0).toUpperCase()}
                                            </div>

                                            <span className="text-xs font-bold text-slate-700 shrink-0">
                                                {fb.sender.name}
                                            </span>

                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider shrink-0 ${fb.type === 'bug'
                                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                : fb.type === 'support'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                }`}>
                                                {fb.type === 'bug' ? 'Lỗi' : fb.type === 'support' ? 'Hỗ trợ' : 'Góp ý'}
                                            </span>

                                            <span className="font-extrabold text-slate-800 text-sm truncate max-w-[280px]">
                                                {fb.title}
                                            </span>

                                            {!isExpanded && (
                                                <span className="text-slate-400 text-xs truncate max-w-[320px] hidden lg:inline font-medium">
                                                    - {fb.content}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 self-end md:self-auto text-xs font-semibold text-slate-400">
                                            <span>{fb.created_at}</span>

                                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider ${fb.status === 'processed'
                                                ? 'bg-slate-100 text-slate-500'
                                                : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                                }`}>
                                                {fb.status === 'processed' ? 'Đã xử lý' : 'Đang chờ'}
                                            </span>

                                            {fb.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkProcessed(fb.id, e)}
                                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-600 text-[10px] font-extrabold rounded-lg transition-colors shrink-0"
                                                >
                                                    Duyệt xử lý
                                                </button>
                                            )}

                                            <svg className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    {/* Nội dung chi tiết */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-1 sm:px-14 sm:pb-6 space-y-4 bg-slate-50/20 border-t border-slate-50">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400 pb-3 border-b border-slate-100/50">
                                                <span>📧 Email: <strong className="text-slate-600">{fb.sender.email}</strong></span>
                                                {fb.sender.phone && <span>📞 SĐT: <strong className="text-slate-600">{fb.sender.phone}</strong></span>}
                                            </div>

                                            <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed font-medium">
                                                {fb.content}
                                            </p>

                                            {fb.image && (
                                                <div className="relative max-w-[280px] rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm group">
                                                    <a href={fb.image} target="_blank" rel="noopener noreferrer" className="block relative">
                                                        <img src={fb.image} alt="Đính kèm" className="w-full h-auto max-h-48 object-cover hover:scale-[1.01] transition-transform duration-200" />
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
        </AdminLayout>
    );
}
