import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Inline Icons
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export default function Index({ packages }) {
    const [editingPackage, setEditingPackage] = useState(null);
    const isFixedDuration = editingPackage ? (editingPackage.duration_type === 'onetime') : false;

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
        } else {
            resetForm();
        }
    }, [editingPackage]);

    const resetForm = () => {
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
        setEditingPackage(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingPackage) {
            put(route('admin.packages.update', editingPackage.id), {
                onSuccess: () => resetForm(),
            });
        } else {
            post(route('admin.packages.store'), {
                onSuccess: () => resetForm(),
            });
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
    };

    const handleDelete = (pkg) => {
        if (confirm(`Bạn có chắc chắn muốn xóa gói cước "${pkg.name}"?`)) {
            router.delete(route('admin.packages.destroy', pkg.id));
        }
    };

    // Format currency VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <AdminLayout title="Quản lý Gói dịch vụ (Subscription)">
            <Head title="Cấu hình Gói cước" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột trái: Danh sách các gói cước */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Các gói cước đang mở</h3>
                                <p className="text-xs text-slate-400 mt-1">Danh sách cấu hình dịch vụ bán phần mềm</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {packages.length === 0 ? (
                                <div className="col-span-2 py-8 text-center text-slate-400 text-sm font-medium">
                                    Chưa có gói cước nào được tạo.
                                </div>
                            ) : (
                                packages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className={`p-6 rounded-2xl border transition-all ${
                                            editingPackage && editingPackage.id === pkg.id
                                                ? 'border-emerald-500 bg-emerald-50/5'
                                                : pkg.is_active
                                                ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                                : 'border-slate-100 bg-slate-50/50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-extrabold text-slate-800 text-base">{pkg.name}</h4>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    pkg.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {pkg.is_active ? 'Đang mở bán' : 'Tắt bán'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(pkg)}
                                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-xl font-black text-teal-800">{formatVND(pkg.price)}</span>
                                            <span className="text-slate-400 text-xs font-bold">
                                                {pkg.duration_type === 'onetime' 
                                                    ? ' / Sài 1 lần' 
                                                    : ` / ${pkg.duration_value || pkg.duration_months} ${pkg.duration_type === 'week' ? 'tuần' : pkg.duration_type === 'year' ? 'năm' : 'tháng'}`}
                                            </span>
                                        </div>

                                        <ul className="space-y-2 text-xs text-slate-600 font-medium mb-4">
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                Hạn mức: <span className="font-bold text-slate-800 pl-1">{pkg.room_limit === 9999 ? 'Không giới hạn' : `${pkg.room_limit} phòng`}</span>
                                            </li>
                                        </ul>

                                        <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                                            {pkg.description || 'Không có mô tả cho gói cước này.'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Cột phải: Form Thêm mới / Cập nhật */}
                <div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-8">
                        <h3 className="text-base font-bold text-slate-800 mb-6">
                            {editingPackage ? `Cập nhật: ${editingPackage.name}` : 'Tạo gói cước mới'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tên gói */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Tên gói cước *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    placeholder="Ví dụ: Gói Cơ Bản, Gói VIP..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>}
                            </div>

                            {/* Giá */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Giá cước (VND) *</label>
                                <input
                                    type="number"
                                    value={data.price}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all"
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                                {errors.price && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.price}</p>}
                            </div>

                            {/* Giới hạn phòng và thời hạn */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-600">Giới hạn phòng *</label>
                                        <label className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={Number(data.room_limit) === 9999}
                                                onChange={(e) => setData('room_limit', e.target.checked ? 9999 : 15)}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                            />
                                            Không giới hạn
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        value={Number(data.room_limit) === 9999 ? '' : data.room_limit}
                                        disabled={Number(data.room_limit) === 9999}
                                        placeholder={Number(data.room_limit) === 9999 ? 'Không giới hạn phòng' : 'Ví dụ: 15, 50'}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all disabled:opacity-60"
                                        onChange={(e) => setData('room_limit', e.target.value)}
                                        required={Number(data.room_limit) !== 9999}
                                    />
                                    {errors.room_limit && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.room_limit}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Thời hạn *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={data.duration_type === 'onetime' ? 1 : data.duration_value}
                                            disabled={data.duration_type === 'onetime'}
                                            placeholder="Số lượng"
                                            className="w-1/2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all disabled:opacity-60"
                                            onChange={(e) => setData('duration_value', e.target.value)}
                                            required
                                            min="1"
                                        />
                                        <select
                                            value={data.duration_type}
                                            className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all cursor-pointer"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData(prev => ({
                                                    ...prev,
                                                    duration_type: val,
                                                    duration_value: val === 'onetime' ? 1 : prev.duration_value
                                                }));
                                            }}
                                        >
                                            <option value="week">Tuần</option>
                                            <option value="month">Tháng</option>
                                            <option value="year">Năm</option>
                                            <option value="onetime">Sài 1 lần</option>
                                        </select>
                                    </div>
                                    {errors.duration_value && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.duration_value}</p>}
                                    {errors.duration_type && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.duration_type}</p>}
                                </div>
                            </div>

                            {/* Trạng thái hoạt động */}
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-300"
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-600 cursor-pointer selection:bg-transparent">
                                    Kích hoạt mở bán gói này
                                </label>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Mô tả chi tiết</label>
                                <textarea
                                    value={data.description}
                                    placeholder="Giới thiệu về gói dịch vụ..."
                                    rows="3"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-800 font-medium transition-all resize-none"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                {editingPackage && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-2.5 border border-slate-100 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Hủy chỉnh sửa
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 disabled:opacity-75"
                                >
                                    {processing ? 'Đang xử lý...' : editingPackage ? 'Lưu thay đổi' : 'Tạo gói cước'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
