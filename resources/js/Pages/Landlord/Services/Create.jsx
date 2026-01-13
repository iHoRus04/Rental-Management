import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        default_price: '',
        unit: 'service',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.services.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="p-6 md:p-10 max-w-3xl mx-auto font-sans">
                <Head title="Thêm dịch vụ mới" />

                {/* HEADER */}
                <div className="mb-8">
                    <Link 
                        href={route('landlord.services.index')}
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Thêm dịch vụ mới</h1>
                    <p className="text-emerald-600/80 font-medium text-sm mt-1">Tạo dịch vụ cho phòng trọ</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    {/* Service Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tên dịch vụ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="VD: Điện, Nước, Internet..."
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Mô tả chi tiết về dịch vụ..."
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Default Price */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Giá mặc định (₫) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.default_price}
                            onChange={(e) => setData('default_price', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="0"
                        />
                        {errors.default_price && <p className="text-red-500 text-sm mt-1">{errors.default_price}</p>}
                    </div>

                    {/* Unit */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Đơn vị tính <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="kwh">kWh (Điện)</option>
                            <option value="m3">m³ (Nước)</option>
                            <option value="month">Tháng</option>
                            <option value="service">Dịch vụ</option>
                        </select>
                        {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                    </div>

                    {/* Is Active */}
                    <div className="mb-8">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Kích hoạt dịch vụ</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Đang lưu...' : 'Lưu dịch vụ'}
                        </button>
                        <Link
                            href={route('landlord.services.index')}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors text-center"
                        >
                            Hủy
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
