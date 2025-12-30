import { useForm, Link, Head } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const [preview, setPreview] = useState(null);

    // Khai báo form với tính năng 'transform'
    const { data, setData, post, processing, errors, transform } = useForm({
        name: "",
        city: "",
        address: "",
        type: "",
        description: "",
        image: null,
    });

    const cities = [
        'Hà Nội', 'Thành phố Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai'
    ];

    const houseTypes = [
        'Chung cư',
        'Nhà nguyên căn',
        'Phòng trọ',
        'Penthouse',
        'Resort',
    ];

    // Xử lý chọn ảnh và tạo preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý submit form
    const submit = (e) => {
        e.preventDefault();

        // TRANSFORM: Nối địa chỉ và thành phố lại trước khi gửi đi
        // Backend sẽ nhận được chuỗi: "Số nhà, Tên đường, Tỉnh/Thành"
        transform((data) => ({
            ...data,
            address: `${data.address}, ${data.city}`,
        }));

        post(route("landlord.houses.store"), {
            forceFormData: true, // Bắt buộc để upload file
            onSuccess: () => console.log('Tạo nhà trọ thành công'),
        });
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Thêm Nhà Trọ Mới" />
            
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
                    {/* Form Header */}
                    <div className="px-8 py-8 border-b border-gray-50 bg-gradient-to-b from-emerald-50/50 to-transparent text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">
                            Thêm Nhà Trọ Mới
                        </h1>
                        <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                            Điền đầy đủ thông tin bên dưới để tạo hồ sơ quản lý nhà trọ mới của bạn.
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        
                        {/* 1. Tên nhà trọ */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên nhà trọ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 shadow-sm"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Ví dụ: Chung cư Mini Xanh..."
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* 2. Khu vực Địa chỉ (Grid 1:2) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Cột 1: Tỉnh/Thành */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Thành phố / Tỉnh <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none shadow-sm cursor-pointer"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn khu vực</option>
                                        {cities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </div>

                            {/* Cột 2: Địa chỉ chi tiết */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 shadow-sm"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        required
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>
                        </div>

                        {/* 3. Mô tả */}
                        {/* 2.5 Loại nhà */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại nhà <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none shadow-sm cursor-pointer"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
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
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mô tả thêm
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none placeholder-gray-300 shadow-sm min-h-[120px]"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                placeholder="Mô tả về tiện ích (wifi, chỗ để xe), nội quy hoặc các ghi chú khác..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* 4. Hình ảnh */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hình ảnh đại diện
                            </label>
                            <div 
                                className={`mt-1 flex flex-col justify-center items-center px-6 pt-8 pb-8 border-2 border-dashed rounded-2xl transition-all group relative bg-gray-50/50 ${
                                    preview ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                                }`}
                            >
                                <div className="space-y-2 text-center">
                                    {preview ? (
                                        <div className="relative inline-block group-hover:scale-[1.02] transition-transform duration-300">
                                            <img src={preview} alt="Preview" className="h-56 w-auto rounded-lg shadow-md object-cover ring-4 ring-white" />
                                            <button 
                                                type="button" 
                                                onClick={() => { setPreview(null); setData('image', null); }}
                                                className="absolute -top-3 -right-3 bg-white text-rose-500 rounded-full p-1.5 shadow-lg border border-gray-100 hover:bg-rose-50 transition-colors"
                                                title="Xóa ảnh"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                                                    <span>Tải ảnh lên</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                                </label>
                                                <span className="pl-1">hoặc kéo thả vào đây</span>
                                            </div>
                                            <p className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {errors.image && <p className="text-red-500 text-sm mt-1 text-center">{errors.image}</p>}
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                            <Link
                                href={route("landlord.houses.index")}
                                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors text-sm"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tạo Nhà Trọ'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;