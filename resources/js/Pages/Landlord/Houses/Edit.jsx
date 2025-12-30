import { Link, useForm, usePage, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit() {
    const { house } = usePage().props;
    const [preview, setPreview] = useState(null);

    // Fallback nếu không có data (phòng trường hợp lỗi)
    if (!house) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin</h3>
                <p className="text-gray-500 mb-6">Nhà trọ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <Link 
                    href={route('landlord.houses.index')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    // If the stored house.address contains "," and house.city is empty,
    // split the last segment as city and rest as specific address.
    const [initialAddress, initialCity] = (() => {
        const addr = house.address || '';
        if (house.city) {
            return [house.address || '', house.city || ''];
        }
        if (!addr) return ['', ''];
        const parts = addr.split(',');
        if (parts.length >= 2) {
            const city = parts.pop().trim();
            const address = parts.join(',').trim();
            return [address, city];
        }
        return [addr, ''];
    })();

    const { data, setData, post, processing, errors, transform } = useForm({
        name: house.name || '',
        type: house.type || '',
        city: initialCity || '',
        address: initialAddress || '',
        description: house.description || '',
        image: null,
        _method: 'PUT', // Giữ nguyên logic PUT qua POST của Laravel
    });

    const houseTypes = [
        'Chung cư',
        'Nhà nguyên căn',
        'Phòng trọ',
        'Nhà trọ/Guesthouse',
        'Khác',
    ];

    const cities = [
        'Hà Nội', 'Thành phố Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai'
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use transform like Create.jsx to concatenate address and city before sending
        transform((formData) => ({
            ...formData,
            address: `${formData.address.trim()}, ${formData.city.trim()}`.replace(/^,\s*/, ''),
        }));

        post(route('landlord.houses.update', house.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Update successful'),
            onError: (err) => console.error('Update errors:', err)
        });
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa nhà trọ: ${house.name}`} />
            
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={route("landlord.houses.index")}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>
                </div>

                <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-50 bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </span>
                            Chỉnh sửa thông tin
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 pl-[52px]">Cập nhật thông tin cho nhà trọ <span className="font-bold text-emerald-600">{house.name}</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Tên nhà trọ */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên nhà trọ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Loại nhà */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại nhà <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none shadow-sm cursor-pointer"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    required
                                >
                                    <option value="">Chọn loại nhà</option>
                                    {houseTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                        </div>

                        {/* Thành phố / Tỉnh (Edit) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Thành phố / Tỉnh <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none shadow-sm cursor-pointer"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    required
                                >
                                    <option value="">Chọn khu vực</option>
                                    {cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 min-h-[120px]"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Mô tả chi tiết..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Hình ảnh */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh</label>
                            
                            {/* Hiển thị ảnh hiện tại hoặc Preview ảnh mới */}
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group relative">
                                <div className="space-y-1 text-center w-full">
                                    {(preview || house.image) ? (
                                        <div className="relative inline-block group/img">
                                            <img 
                                                src={preview || `/storage/${house.image}`} 
                                                alt="Preview" 
                                                className="h-64 rounded-xl shadow-md object-cover mx-auto" 
                                            />
                                            {/* Badge trạng thái ảnh */}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                                {preview ? 'Ảnh mới chọn' : 'Ảnh hiện tại'}
                                            </div>
                                            
                                            {/* Nút xóa chọn ảnh mới */}
                                            {preview && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setPreview(null); setData('image', null); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                                    title="Hủy chọn ảnh mới"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        // Empty State khi không có ảnh cũ lẫn mới
                                        <div className="py-4">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-sm text-gray-500">Chưa có ảnh đại diện</p>
                                        </div>
                                    )}

                                    <div className="flex text-sm text-gray-600 justify-center mt-4">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                            <span>{house.image || preview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                                </div>
                            </div>
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                            <Link
                                href={route('landlord.houses.index')}
                                className="px-6 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;