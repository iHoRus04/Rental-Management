import { Link, usePage, router, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import AlertModal from '@/Components/AlertModal';

export default function Show() {
    const { house, room, activeContract, allServices = [], auth } = usePage().props;
    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canEditRoom = isLandlord || userPerms.includes('rooms.edit');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [confirmDetach, setConfirmDetach] = useState({ show: false, pivotId: null });
    const [confirmRemoveImg, setConfirmRemoveImg] = useState({ show: false, index: null });
    const [errorAlert, setErrorAlert] = useState({ show: false, message: '' });

    // Filter room services and available system services
    const roomServices = room.services || [];
    const attachedServiceIds = roomServices.map(s => s.id);
    const availableServices = allServices.filter(s => !attachedServiceIds.includes(s.id));

    // Form for attaching a new service
    const { data: serviceForm, setData: setServiceForm, post: postService, processing: serviceProcessing, errors: serviceErrors, reset: resetServiceForm } = useForm({
        service_id: '',
        price: '',
        note: '',
    });

    const handleSelectServiceChange = (e) => {
        const selectedId = e.target.value;
        const found = allServices.find(s => String(s.id) === String(selectedId));
        setServiceForm(data => ({
            ...data,
            service_id: selectedId,
            price: found ? found.default_price : '',
            note: '',
        }));
    };

    const handleAttachServiceSubmit = (e) => {
        e.preventDefault();
        postService(route('landlord.rooms.services.attach', room.id), {
            onSuccess: () => {
                setShowAddServiceModal(false);
                resetServiceForm();
            }
        });
    };

    const handleDetachService = (pivotId) => {
        setConfirmDetach({ show: true, pivotId });
    };

    const executeDetach = () => {
        router.delete(route('landlord.room-services.detach', confirmDetach.pivotId), {
            onFinish: () => setConfirmDetach({ show: false, pivotId: null }),
        });
    };

    const formatUnit = (unit) => {
        const unitMap = {
            'kwh': 'kWh',
            'm3': 'm³',
            'month': 'tháng',
            'service': 'lần'
        };
        return unitMap[unit] || unit;
    };
    
    // Parse images
    const images = room.images ? JSON.parse(room.images) : [];

    // Format status
    const formatStatus = (status) => {
        const statusMap = {
            'available': { label: 'Còn trống', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓', dot: 'bg-emerald-500' },
            'occupied': { label: 'Đã cho thuê', bg: 'bg-blue-100', text: 'text-blue-700', icon: '👤', dot: 'bg-blue-500' },
            'maintenance': { label: 'Đang sửa chữa', bg: 'bg-amber-100', text: 'text-amber-700', icon: '🔧', dot: 'bg-amber-500' }
        };
        return statusMap[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    };

    const statusInfo = formatStatus(room.status);

    const removeImage = (index) => {
        setConfirmRemoveImg({ show: true, index });
    };

    const executeRemoveImage = () => {
        router.delete(
            route('landlord.houses.rooms.removeImage', [house.id, room.id]),
            {
                data: { index: confirmRemoveImg.index },
                onSuccess: () => setConfirmRemoveImg({ show: false, index: null }),
                onError: () => {
                    setConfirmRemoveImg({ show: false, index: null });
                    setErrorAlert({ show: true, message: 'Có lỗi xảy ra khi xóa hình ảnh' });
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Chi tiết ${room.name}`} />
            
            <div className="max-w-[1600px] mx-auto">
                
                {/* --- HEADER INFO --- */}
                <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                        <div>
                            <Link href={route('landlord.houses.rooms.index', house.id)} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-emerald-600 mb-4 transition-colors">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách
                            </Link>

                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.bg} ${statusInfo.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`}></span>
                                    {statusInfo.label}
                                </span>
                                <span className="text-gray-400 text-sm">#{room.id}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-teal-900 tracking-tight mb-2">{room.name}</h1>
                            <p className="text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {house.address}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right mr-4 hidden sm:block">
                                <p className="text-sm text-gray-500 font-medium">Giá thuê hiện tại</p>
                                <p className="text-3xl font-extrabold text-emerald-600">
                                    {parseInt(room.price).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm font-semibold text-gray-400">₫/tháng</span>
                                </p>
                            </div>
                            {canEditRoom && (
                                <Link
                                    href={route('landlord.houses.rooms.edit', [house.id, room.id])}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 hover:border-emerald-200 text-gray-700 hover:text-emerald-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Chỉnh sửa
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Info, Contract & Services */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Room Info Card */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                Thông tin chi tiết
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-500 text-sm font-medium">Tầng</span>
                                    <span className="font-bold text-gray-900">{room.floor || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-500 text-sm font-medium">Diện tích</span>
                                    <span className="font-bold text-gray-900">{room.area ? `${room.area} m²` : 'N/A'}</span>
                                </div>
                                {room.description && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Mô tả</span>
                                        <p className="text-gray-700 text-sm leading-relaxed">{room.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ROOM SERVICES CARD */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-emerald-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </span>
                                    Dịch vụ áp dụng ({roomServices.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddServiceModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    Thêm dịch vụ
                                </button>
                            </div>

                            {roomServices.length > 0 ? (
                                <div className="space-y-3">
                                    {roomServices.map((service) => (
                                        <div key={service.id} className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 transition-colors flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-slate-800">{service.name}</span>
                                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 uppercase">
                                                        /{formatUnit(service.unit)}
                                                    </span>
                                                </div>
                                                <p className="text-emerald-700 font-extrabold text-xs">
                                                    {parseInt(service.pivot?.price || service.default_price).toLocaleString('vi-VN')} ₫
                                                </p>
                                                {service.pivot?.note && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{service.pivot.note}</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDetachService(service.pivot?.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Gỡ dịch vụ"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-medium mb-3">Chưa gán dịch vụ nào cho phòng này</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddServiceModal(true)}
                                        className="text-xs font-bold text-emerald-600 hover:underline"
                                    >
                                        + Thêm dịch vụ ngay
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Contract / Tenant Info */}
                        {activeContract && activeContract.renterRequest ? (
                            <div className="bg-white rounded-[24px] shadow-sm border border-blue-100 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                                <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2 relative z-10">
                                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                                    Người thuê hiện tại
                                </h3>

                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 border-white shadow-md">
                                            {activeContract.renterRequest.name.charAt(0)}
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900">{activeContract.renterRequest.name}</h4>
                                        <p className="text-gray-500 text-sm">{activeContract.renterRequest.phone}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-2 border-b border-dashed border-gray-200">
                                            <span className="text-gray-500">Ngày bắt đầu</span>
                                            <span className="font-semibold text-gray-900">{new Date(activeContract.start_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-dashed border-gray-200">
                                            <span className="text-gray-500">Ngày kết thúc</span>
                                            <span className="font-semibold text-gray-900">{new Date(activeContract.end_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2">
                                            <span className="text-gray-500">Tiền cọc</span>
                                            <span className="font-bold text-emerald-600">{(activeContract.deposit || 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <Link 
                                            href={route('landlord.rooms.contracts.index', [room.id])}
                                            className="block w-full py-2.5 bg-blue-50 text-blue-700 text-center font-bold rounded-xl hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            Xem chi tiết hợp đồng
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[24px] shadow-sm border border-dashed border-gray-300 p-8 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                </div>
                                <h4 className="text-gray-900 font-bold mb-1">Chưa có người thuê</h4>
                                <p className="text-gray-500 text-sm mb-4">Phòng này hiện đang trống.</p>
                                <Link href={route('landlord.rooms.contracts.create', room.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                                    Tạo hợp đồng mới
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Gallery */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 min-h-[500px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                                    Thư viện hình ảnh
                                </h3>
                                <Link
                                    href={route('landlord.houses.rooms.edit', [house.id, room.id])}
                                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                    + Quản lý ảnh
                                </Link>
                            </div>

                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((image, index) => (
                                        <div 
                                            key={index} 
                                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`Room ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <span className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors" title="Xem ảnh">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                    className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors"
                                                    title="Xóa ảnh"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <Link 
                                        href={route('landlord.houses.rooms.edit', [house.id, room.id])}
                                        className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                                    >
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        <span className="text-sm font-bold">Thêm ảnh</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-gray-500 font-medium mb-4">Chưa có hình ảnh nào</p>
                                    <Link
                                        href={route('landlord.houses.rooms.edit', [house.id, room.id])}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition-colors shadow-sm"
                                    >
                                        Tải ảnh lên ngay
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ADD SERVICE MODAL --- */}
                {showAddServiceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
                            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                                <h3 className="text-lg font-extrabold text-teal-900 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </span>
                                    Thêm Dịch Vụ Cho Phòng
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddServiceModal(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleAttachServiceSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                                        Chọn Dịch Vụ <span className="text-red-500">*</span>
                                    </label>
                                    {availableServices.length > 0 ? (
                                        <select
                                            value={serviceForm.service_id}
                                            onChange={handleSelectServiceChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        >
                                            <option value="">-- Chọn dịch vụ --</option>
                                            {availableServices.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({parseInt(s.default_price).toLocaleString('vi-VN')} ₫/{formatUnit(s.unit)})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-medium text-amber-800">
                                            Tất cả các dịch vụ hệ thống đã được thêm vào phòng này!
                                        </div>
                                    )}
                                    {serviceErrors.service_id && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{serviceErrors.service_id}</p>
                                    )}
                                </div>

                                {serviceForm.service_id && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                                                Đơn Giá Áp Dụng (VNĐ) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={serviceForm.price}
                                                onChange={(e) => setServiceForm('price', e.target.value)}
                                                placeholder="Nhập đơn giá..."
                                                required
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            {serviceErrors.price && (
                                                <p className="text-red-500 text-xs mt-1 font-medium">{serviceErrors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                                                Ghi Chú (Tùy chọn)
                                            </label>
                                            <textarea
                                                rows="2"
                                                value={serviceForm.note}
                                                onChange={(e) => setServiceForm('note', e.target.value)}
                                                placeholder="Ghi chú thêm về dịch vụ này..."
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddServiceModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    {availableServices.length > 0 && serviceForm.service_id && (
                                        <button
                                            type="submit"
                                            disabled={serviceProcessing}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                                        >
                                            {serviceProcessing ? 'Đang thêm...' : 'Xác nhận Thêm'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- IMAGE MODAL --- */}
                {selectedImage && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-5xl w-full max-h-[90vh]">
                            <img
                                src={`/storage/${selectedImage}`}
                                alt="Full size"
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmModal
                show={confirmDetach.show}
                onClose={() => setConfirmDetach({ show: false, pivotId: null })}
                onConfirm={executeDetach}
                title="Gỡ dịch vụ"
                message="Bạn có chắc muốn gỡ dịch vụ này khỏi phòng?"
                confirmText="Gỡ dịch vụ"
                type="danger"
            />
            <ConfirmModal
                show={confirmRemoveImg.show}
                onClose={() => setConfirmRemoveImg({ show: false, index: null })}
                onConfirm={executeRemoveImage}
                title="Xóa hình ảnh"
                message="Bạn có chắc muốn xóa hình ảnh này không?"
                confirmText="Xóa"
                type="danger"
            />
            <AlertModal
                show={errorAlert.show}
                onClose={() => setErrorAlert({ show: false, message: '' })}
                title="Lỗi"
                message={errorAlert.message}
                type="error"
            />
        </div>
    );
}

Show.layout = (page) => <AuthenticatedLayout children={page} />;