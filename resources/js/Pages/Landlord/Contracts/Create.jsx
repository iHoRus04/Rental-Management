import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { room, renterRequests } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        renter_request_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        monthly_rent: room.price ? Math.floor(room.price) : '',
        deposit: '',
        payment_date: '5',
        terms: `ĐIỀU KHOẢN HỢP ĐỒNG

1. Trách nhiệm của người thuê
- Thanh toán tiền thuê đúng hạn
- Giữ gìn tài sản và vệ sinh phòng ở
- Không được tự ý sửa chữa, cải tạo phòng
- Thông báo trước 30 ngày nếu muốn chấm dứt hợp đồng sớm

2. Trách nhiệm của chủ nhà
- Đảm bảo cơ sở vật chất hoạt động tốt
- Sửa chữa các hư hỏng không do lỗi người thuê
- Thông báo trước các thay đổi về giá hoặc điều khoản

3. Chấm dứt hợp đồng
- Hai bên có quyền chấm dứt hợp đồng với thông báo trước 30 ngày
- Hoàn trả tiền đặt cọc sau khi kiểm tra tình trạng phòng`,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('landlord.rooms.contracts.store', room.id));
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Tạo hợp đồng - ${room.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <Link
                        href={route('landlord.rooms.contracts.index', room.id)}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách hợp đồng
                    </Link>

                    <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </span>
                                Tạo hợp đồng mới
                            </h1>
                            <p className="text-gray-500 mt-2 pl-[52px]">
                                Đang tạo hợp đồng cho phòng <span className="font-bold text-gray-900">{room.name}</span>
                            </p>
                        </div>
                        {/* Decor blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: Chọn người thuê */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">1</span>
                                Chọn người thuê
                            </h2>

                            {renterRequests.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Danh sách yêu cầu đã được duyệt:</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renterRequests.map(request => (
                                            <label 
                                                key={request.id} 
                                                className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                                                    data.renter_request_id === request.id 
                                                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="renter_request_id"
                                                    value={request.id}
                                                    checked={data.renter_request_id === request.id}
                                                    onChange={() => setData('renter_request_id', request.id)}
                                                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-gray-900 text-lg">{request.name}</span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Đã duyệt</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                                        <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {request.phone}</span>
                                                        {request.email && <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {request.email}</span>}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Chưa có yêu cầu thuê nào</h4>
                                        <p className="text-amber-700 text-sm mt-1">Vui lòng duyệt yêu cầu thuê trước khi tạo hợp đồng.</p>
                                    </div>
                                </div>
                            )}
                            {errors.renter_request_id && <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.renter_request_id}</p>}
                        </div>

                        {/* Section 2: Thời hạn & Tài chính */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">2</span>
                                Chi tiết hợp đồng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Ngày bắt đầu */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày bắt đầu <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        required
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                </div>

                                {/* Ngày kết thúc */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Giá thuê */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Giá thuê (tháng) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="number" step="1"
                                            value={data.monthly_rent}
                                            onChange={e => setData('monthly_rent', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12 font-bold text-gray-900"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">đ</div>
                                    </div>
                                    {errors.monthly_rent && <p className="text-red-500 text-sm mt-1">{errors.monthly_rent}</p>}
                                </div>

                                {/* Tiền cọc */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tiền đặt cọc</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="1"
                                            value={data.deposit}
                                            onChange={e => setData('deposit', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12 font-bold text-gray-900"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">đ</div>
                                    </div>
                                    {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
                                </div>

                                {/* Ngày thanh toán */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày thanh toán <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.payment_date}
                                            onChange={e => setData('payment_date', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none appearance-none bg-white"
                                        >
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Ngày {i + 1} hàng tháng</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Điều khoản */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-extrabold">3</span>
                                Điều khoản hợp đồng
                            </h2>
                            <div className="relative">
                                <textarea
                                    value={data.terms}
                                    onChange={e => setData('terms', e.target.value)}
                                    rows={12}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-mono text-sm leading-relaxed bg-gray-50/50"
                                    placeholder="Nhập các điều khoản..."
                                />
                                <div className="absolute top-3 right-3 text-xs text-gray-400 font-bold bg-white px-2 py-1 rounded border border-gray-200">MARKDOWN SUPPORTED</div>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={route('landlord.rooms.contracts.index', room.id)}
                                className="px-6 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.renter_request_id}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {processing ? 'Đang xử lý...' : 'Tạo Hợp Đồng'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page) => <AuthenticatedLayout children={page} />;