import { useForm, Link, usePage, Head } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { house } = usePage().props;
    const [previews, setPreviews] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        price: "",
        status: "available",
        floor: "",
        area: "",
        description: "",
        images: [],
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5); // Limit 5 files
        setData("images", files);

        const newPreviews = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === files.length) {
                    setPreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        // Note: Removing from FileList is tricky, so for simplicity in this UI demo we just clear previews. 
        // In a real app, you might want to manage a separate array of files to upload.
        setPreviews([]); 
        setData("images", []);
        // Reset input value if needed via ref
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
        
        if (data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images[]', data.images[i]);
            }
        }

        post(route("landlord.houses.rooms.store", house.id), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Thêm phòng - ${house.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={route("landlord.houses.rooms.index", house.id)}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách phòng
                    </Link>
                </div>

                <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-50 bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </span>
                            Thêm phòng mới
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 pl-[52px]">
                            Đang thêm phòng cho nhà trọ: <span className="font-bold text-emerald-600">{house.name}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Section 1: Thông tin cơ bản */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Thông tin cơ bản
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tên phòng */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Tên phòng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300"
                                        placeholder="VD: Phòng 101, P.202..."
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Giá phòng */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Giá thuê (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number" step="1"
                                            value={data.price}
                                            onChange={(e) => setData("price", e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 pr-12"
                                            placeholder="0"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">đ</div>
                                    </div>
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>

                                {/* Trạng thái */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData("status", e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none appearance-none bg-white"
                                            required
                                        >
                                            <option value="available">✓ Còn trống</option>
                                            <option value="occupied">👤 Đã cho thuê</option>
                                            <option value="maintenance">🔧 Đang bảo trì</option>
                                        </select>
                                      
                                    </div>
                                </div>

                                {/* Tầng & Diện tích */}
                                <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tầng</label>
                                        <input
                                            type="number" step="1"
                                            value={data.floor}
                                            onChange={(e) => setData("floor", e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="VD: 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Diện tích (m²)</label>
                                        <input
                                            type="number" step="1"
                                            value={data.area}
                                            onChange={(e) => setData("area", e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="VD: 25"
                                        />
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 min-h-[100px]"
                                        placeholder="Mô tả về nội thất, tiện ích..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Hình ảnh */}
                        <div className="mb-8 pt-8 border-t border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Hình ảnh phòng
                            </h2>

                            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                                <div className="space-y-2 text-center w-full">
                                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-emerald-500 transition-colors">
                                        <svg stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                                            <span>Tải ảnh lên</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">hoặc kéo thả vào đây</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG tối đa 5 ảnh (2MB/ảnh)</p>
                                </div>
                            </div>
                            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}

                            {/* Preview Grid */}
                            {previews.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                            <Link
                                href={route("landlord.houses.rooms.index", house.id)}
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
                                {processing ? 'Đang lưu...' : 'Tạo Phòng'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;