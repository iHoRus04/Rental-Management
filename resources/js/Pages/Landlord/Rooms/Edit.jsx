import { Link, useForm, usePage, router, Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit() {
    const { house, room } = usePage().props;
    const [newPreviews, setNewPreviews] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        name: room.name,
        price: room.price ? Math.floor(room.price) : '',
        status: room.status,
        floor: room.floor || '',
        area: room.area || '',
        description: room.description || '',
        images: [],
        _method: 'PUT',
    });

    // Parse existing images if they exist
    const existingImages = room.images ? JSON.parse(room.images) : [];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5 - existingImages.length);
        setData('images', files);

        const previews = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                if (previews.length === files.length) {
                    setNewPreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index) => {
        if (confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) {
            router.delete(
                route('landlord.houses.rooms.removeImage', [house.id, room.id]),
                {
                    data: { index },
                    preserveScroll: true,
                    onSuccess: () => {},
                    onError: (errors) => alert('Có lỗi xảy ra khi xóa hình ảnh'),
                }
            );
        }
    };

    const removeNewImage = (index) => {
        const newImages = data.images.filter((_, i) => i !== index);
        setData('images', newImages);
        setNewPreviews(newPreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price);
        formData.append('status', data.status);
        formData.append('floor', data.floor);
        formData.append('area', data.area);
        formData.append('description', data.description);
        formData.append('_method', 'PUT');

        if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images[]', data.images[i]);
            }
        }

        post(route('landlord.houses.rooms.update', [house.id, room.id]), {
            data: formData,
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Sửa phòng - ${room.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.houses.rooms.show', [house.id, room.id])}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại chi tiết phòng
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </span>
                                Chỉnh sửa thông tin phòng
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Đang cập nhật thông tin cho phòng <span className="font-bold text-gray-900">{room.name}</span> thuộc nhà <span className="font-bold text-emerald-600">{house.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Thông tin cơ bản */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Thông tin chung
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Tên phòng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Tên phòng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                        placeholder="VD: Phòng 101, P.202..."
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Giá & Trạng thái */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Giá thuê (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={data.price}
                                                onChange={e => setData('price', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12 font-bold text-gray-900"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">đ</div>
                                        </div>
                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Trạng thái <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={data.status}
                                                onChange={e => setData('status', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                                            >
                                                <option value="available">✓ Còn trống</option>
                                                <option value="occupied">👤 Đã cho thuê</option>
                                                <option value="maintenance">🔧 Đang sửa chữa</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Tầng & Diện tích */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tầng</label>
                                        <input
                                            type="number"
                                            value={data.floor}
                                            onChange={e => setData('floor', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="VD: 1"
                                        />
                                        {errors.floor && <p className="text-red-500 text-sm mt-1">{errors.floor}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Diện tích (m²)</label>
                                        <input
                                            type="number"
                                            value={data.area}
                                            onChange={e => setData('area', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="VD: 25.5"
                                        />
                                        {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 min-h-[100px]"
                                        placeholder="Mô tả về nội thất, tiện ích..."
                                    ></textarea>
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Hình ảnh */}
                        <div className="pt-8 border-t border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Quản lý hình ảnh
                            </h2>

                            {/* Ảnh hiện tại */}
                            {existingImages.length > 0 && (
                                <div className="mb-8">
                                    <p className="text-sm font-bold text-gray-700 mb-3">Ảnh hiện tại ({existingImages.length})</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                <img src={`/storage/${image}`} alt={`Room ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                        title="Xóa ảnh này"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thêm ảnh mới */}
                            {existingImages.length < 5 && (
                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-2">Thêm ảnh mới (Tối đa {5 - existingImages.length} ảnh)</p>
                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                                        <div className="space-y-1 text-center w-full">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-emerald-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                                                    <span>Tải ảnh lên</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageChange} accept="image/*" />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả vào đây</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                                        </div>
                                    </div>
                                    {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}

                                    {/* Preview ảnh mới */}
                                    {newPreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {newPreviews.map((preview, index) => (
                                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-emerald-200 ring-2 ring-emerald-100">
                                                    <img src={preview} alt={`New preview ${index}`} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.houses.rooms.show', [house.id, room.id])}
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
                                {processing ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AuthenticatedLayout children={page} />;