import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Settings({ settings }) {
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(settings.logo || null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_name: settings.app_name || 'DreamHouses',
        logo: null,
        support_phone: settings.support_phone || '',
        support_email: settings.support_email || '',
        support_address: settings.support_address || '',
        maintenance_mode: settings.maintenance_mode ? 1 : 0,
        _method: 'POST' // Handle multipart file upload via POST
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTriggerFile = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            onSuccess: () => {
                // Clear selected file
                setData('logo', null);
            }
        });
    };

    return (
        <AdminLayout title="Cài đặt hệ thống">
            <Head title="Cài đặt hệ thống" />

            <div className="max-w-[1000px] mx-auto pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Settings Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                        <div className="border-b border-slate-50 pb-5 mb-6">
                            <h3 className="text-base font-extrabold text-slate-800">Cấu hình chung</h3>
                            <p className="text-xs text-slate-400 mt-1">Quản lý các thông số chung của ứng dụng, thương hiệu và thông tin hỗ trợ kỹ thuật.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left: Logo Upload & Preview */}
                            <div className="md:col-span-1 flex flex-col items-center justify-start py-4 border-r border-slate-50 pr-6">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Logo hệ thống</span>
                                
                                <div className="relative group cursor-pointer mb-4" onClick={handleTriggerFile}>
                                    <div className="w-32 h-32 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner-sm transition-all group-hover:opacity-90">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center p-3">
                                                <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span className="text-[10px] text-slate-400 font-bold">Chọn ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[11px] font-bold">Thay đổi ảnh</span>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <span className="text-[10px] text-slate-400 text-center font-medium leading-normal max-w-[180px]">
                                    Hỗ trợ định dạng PNG, JPG. Dung lượng tối đa 2MB.
                                </span>
                                {errors.logo && (
                                    <p className="text-xs text-rose-500 font-semibold mt-2">{errors.logo}</p>
                                )}
                            </div>

                            {/* Right: Text Fields */}
                            <div className="md:col-span-2 space-y-5">
                                {/* App Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên ứng dụng *</label>
                                    <input
                                        type="text"
                                        value={data.app_name}
                                        onChange={(e) => setData('app_name', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                                        placeholder="Ví dụ: DreamHouses"
                                    />
                                    {errors.app_name && (
                                        <p className="text-xs text-rose-500 font-semibold mt-1.5">{errors.app_name}</p>
                                    )}
                                </div>

                                {/* Support Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại hỗ trợ *</label>
                                    <input
                                        type="text"
                                        value={data.support_phone}
                                        onChange={(e) => setData('support_phone', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                                        placeholder="Ví dụ: 0987654321"
                                    />
                                    {errors.support_phone && (
                                        <p className="text-xs text-rose-500 font-semibold mt-1.5">{errors.support_phone}</p>
                                    )}
                                </div>

                                {/* Support Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email liên hệ hỗ trợ *</label>
                                    <input
                                        type="email"
                                        value={data.support_email}
                                        onChange={(e) => setData('support_email', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                                        placeholder="Ví dụ: support@dreamhouses.vn"
                                    />
                                    {errors.support_email && (
                                        <p className="text-xs text-rose-500 font-semibold mt-1.5">{errors.support_email}</p>
                                    )}
                                </div>

                                {/* Support Address */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ hỗ trợ *</label>
                                    <textarea
                                        rows={3}
                                        value={data.support_address}
                                        onChange={(e) => setData('support_address', e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700 leading-normal resize-none"
                                        placeholder="Ví dụ: 123 Đường Láng, Đống Đa, Hà Nội"
                                    />
                                    {errors.support_address && (
                                        <p className="text-xs text-rose-500 font-semibold mt-1.5">{errors.support_address}</p>
                                    )}
                                </div>

                                {/* Maintenance Mode */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chế độ bảo trì hệ thống</label>
                                    <select
                                        value={data.maintenance_mode}
                                        onChange={(e) => setData('maintenance_mode', parseInt(e.target.value))}
                                        className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-600 cursor-pointer"
                                    >
                                        <option value={0}>Hoạt động bình thường</option>
                                        <option value={1}>Bảo trì hệ thống (Chỉ quản trị viên truy cập)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="border-t border-slate-50 mt-8 pt-5 flex items-center justify-end gap-3">
                            {recentlySuccessful && (
                                <span className="text-xs text-emerald-600 font-bold animate-fade-in">
                                    ✓ Lưu cài đặt thành công
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang lưu...
                                    </>
                                ) : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
