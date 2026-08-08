import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

// Inline Icons
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export default function Index({ packages }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, pkg: null });

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        price: '',
        room_limit: '',
        duration_value: '',
        duration_type: 'month',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        if (editingPackage) {
            setData({
                name: editingPackage.name,
                price: editingPackage.price,
                room_limit: editingPackage.room_limit,
                duration_value: editingPackage.duration_value || editingPackage.duration_months || 1,
                duration_type: editingPackage.duration_type || 'month',
                description: editingPackage.description || '',
                is_active: !!editingPackage.is_active,
            });
        }
    }, [editingPackage]);

    const openCreateModal = () => {
        setEditingPackage(null);
        reset({
            name: '',
            price: '',
            room_limit: '',
            duration_value: '',
            duration_type: 'month',
            description: '',
            is_active: true,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingPackage) {
            put(route('admin.packages.update', editingPackage.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.packages.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (pkg) => {
        setConfirmDelete({ show: true, pkg });
    };

    const executeDelete = () => {
        router.delete(route('admin.packages.destroy', confirmDelete.pkg.id), {
            onFinish: () => setConfirmDelete({ show: false, pkg: null }),
        });
    };

    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <AdminLayout title="Quản lý Gói dịch vụ (Subscription)">
            <Head title="Cấu hình Gói cước" />

            <div className="space-y-6 max-w-[1400px] mx-auto">
                {/* Header danh sách */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Các gói dịch vụ</h3>
                        <p className="text-xs text-slate-400 mt-1">Danh sách các gói cước bán quyền truy cập và hạn mức sử dụng phòng trọ cho Chủ trọ.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.97] flex items-center gap-1.5"
                    >
                        <PlusIcon /> Tạo gói cước mới
                    </button>
                </div>

                {/* Grid danh sách các gói cước mở rộng */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
                            Chưa có gói cước nào được tạo. Click nút "Tạo gói cước mới" để bắt đầu.
                        </div>
                    ) : (
                        packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`p-6 rounded-3xl border transition-all ${
                                    pkg.is_active
                                        ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                        : 'border-slate-100 bg-slate-50/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-base">{pkg.name}</h4>
                                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider ${
                                            pkg.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {pkg.is_active ? 'ĐANG MỞ BÁN' : 'TẮT BÁN'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => openEditModal(pkg)}
                                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-100"
                                            title="Chỉnh sửa"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg)}
                                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all border border-transparent hover:border-red-100"
                                            title="Xóa"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-2xl font-black text-teal-800">{formatVND(pkg.price)}</span>
                                    <span className="text-slate-400 text-xs font-bold">
                                        {pkg.duration_type === 'onetime' 
                                            ? ` / Dùng thử ${pkg.duration_value} ngày (1 lần)` 
                                            : ` / ${pkg.duration_value || pkg.duration_months} ${pkg.duration_type === 'week' ? 'tuần' : pkg.duration_type === 'year' ? 'năm' : 'tháng'}`}
                                    </span>
                                </div>

                                <ul className="space-y-2 text-xs text-slate-600 font-bold mb-4 border-t border-slate-50 pt-3">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Hạn mức: <span className="font-extrabold text-slate-800 pl-1">{pkg.room_limit === 9999 ? 'Không giới hạn phòng' : `${pkg.room_limit} phòng`}</span>
                                    </li>
                                </ul>

                                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 font-medium">
                                    {pkg.description || 'Không có mô tả cho gói cước này.'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODAL THÊM / CẬP NHẬT GÓI CƯỚC NỔI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[500px] rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Nút đóng */}
                        <button
                            onClick={closeModal}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingPackage ? `✍️ Cập nhật gói: ${editingPackage.name}` : '✏️ Tạo gói cước dịch vụ mới'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Cấu hình các thông số hạn mức và thời gian bán quyền sử dụng.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tên gói */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên gói cước *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    placeholder="Ví dụ: Gói Cơ Bản, Gói VIP..."
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.name}</p>}
                            </div>

                            {/* Giá */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Giá cước (VND) *</label>
                                <input
                                    type="number"
                                    value={data.price}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all"
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                                {errors.price && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.price}</p>}
                            </div>

                            {/* Hạn mức phòng */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn mức phòng *</label>
                                    <label className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={Number(data.room_limit) === 9999}
                                            onChange={(e) => setData('room_limit', e.target.checked ? 9999 : 15)}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                        />
                                        Không giới hạn số phòng
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    value={Number(data.room_limit) === 9999 ? '' : data.room_limit}
                                    disabled={Number(data.room_limit) === 9999}
                                    placeholder={Number(data.room_limit) === 9999 ? 'Không giới hạn phòng (Vô hạn)' : 'Ví dụ: 15, 50, 100'}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all disabled:opacity-60"
                                    onChange={(e) => setData('room_limit', e.target.value)}
                                    required={Number(data.room_limit) !== 9999}
                                />
                                {errors.room_limit && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.room_limit}</p>}
                            </div>

                            {/* Thời hạn gói */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thời hạn gói *</label>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        value={data.duration_value}
                                        placeholder={data.duration_type === 'onetime' ? "Số ngày dùng thử (Ví dụ: 7, 14, 30)" : "Số lượng thời gian"}
                                        className="flex-1 px-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-semibold transition-all"
                                        onChange={(e) => setData('duration_value', e.target.value)}
                                        required
                                        min="1"
                                    />
                                    <select
                                        value={data.duration_type}
                                        className="w-44 px-3 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-bold transition-all cursor-pointer animate-none"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData(prev => ({
                                                ...prev,
                                                duration_type: val,
                                                duration_value: val === 'onetime' ? 7 : prev.duration_value
                                            }));
                                        }}
                                    >
                                        <option value="week">Tuần</option>
                                        <option value="month">Tháng</option>
                                        <option value="year">Năm</option>
                                        <option value="onetime">Sài 1 lần</option>
                                    </select>
                                </div>
                                {errors.duration_value && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.duration_value}</p>}
                                {errors.duration_type && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.duration_type}</p>}
                            </div>

                            {/* Trạng thái hoạt động */}
                            <div className="flex items-center gap-2.5 py-1">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-300 cursor-pointer"
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                    Kích hoạt mở bán gói dịch vụ này
                                </label>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                                <textarea
                                    value={data.description}
                                    placeholder="Giới thiệu về gói dịch vụ..."
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 font-medium transition-all resize-none"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errors.description}</p>}
                            </div>

                            {/* Nút Submit cuối modal */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-all active:scale-[0.98]"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]"
                                >
                                    {processing ? 'Đang lưu...' : editingPackage ? 'Lưu thay đổi' : 'Tạo gói cước'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, pkg: null })}
                onConfirm={executeDelete}
                title="Xóa gói cước"
                message={`Bạn có chắc chắn muốn xóa gói cước "${confirmDelete.pkg?.name}"?`}
                confirmText="Xóa gói cước"
                type="danger"
            />
        </AdminLayout>
    );
}
