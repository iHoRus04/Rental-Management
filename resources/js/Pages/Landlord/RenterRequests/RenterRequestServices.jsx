import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function RenterRequestServices({ auth, renterRequest, renterRequestServices, allServices }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const { data, setData, post, reset, processing, errors } = useForm({
        service_id: '',
        price: '',
        note: '',
        start_date: '',
        end_date: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing } = useForm({
        price: '',
        is_active: true,
        note: '',
        start_date: '',
        end_date: '',
    });

    const handleAddService = (e) => {
        e.preventDefault();
        post(route('landlord.renter-requests.services.attach', renterRequest.id), {
            onSuccess: () => {
                reset();
                setShowAddModal(false);
            }
        });
    };

    const handleEditService = (e) => {
        e.preventDefault();
        put(route('landlord.renter-request-services.update', editingService.pivot.id), {
            onSuccess: () => {
                setEditingService(null);
            }
        });
    };

    const handleDeleteService = (renterRequestServiceId) => {
        if (confirm('Bạn có chắc chắn muốn gỡ dịch vụ này?')) {
            router.delete(route('landlord.renter-request-services.detach', renterRequestServiceId));
        }
    };

    const getUnitLabel = (unit) => {
        const units = {
            'kwh': 'kWh',
            'm3': 'm³',
            'month': 'Tháng',
            'service': 'Dịch vụ'
        };
        return units[unit] || unit;
    };

    // Filter out services already attached to renter request
    const availableServices = allServices.filter(
        service => !renterRequestServices.some(rs => rs.id === service.id)
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="p-6 md:p-10 max-w-[1400px] mx-auto font-sans">
                <Head title={`Dịch vụ - ${renterRequest.name}`} />

                {/* HEADER */}
                <div className="mb-8">
                    <Link 
                        href={route('landlord.renter-requests.index')}
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách yêu cầu thuê
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Dịch vụ - {renterRequest.name}</h1>
                            <p className="text-emerald-600/80 font-medium text-sm mt-1">
                                Quản lý dịch vụ cho khách hàng này
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Thêm dịch vụ
                        </button>
                    </div>
                </div>

                {/* SERVICES LIST */}
                {renterRequestServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {renterRequestServices.map((service) => (
                            <div 
                                key={service.id} 
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h3>
                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                                {getUnitLabel(service.unit)}
                                            </span>
                                        </div>
                                        
                                        {service.pivot.is_active ? (
                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-2xl font-extrabold text-emerald-600">
                                                {new Intl.NumberFormat('vi-VN').format(service.pivot.price)}
                                            </span>
                                            <span className="text-sm text-gray-500">₫</span>
                                        </div>
                                        
                                        {service.pivot.start_date && (
                                            <p className="text-xs text-gray-500">
                                                Bắt đầu: {new Date(service.pivot.start_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                        {service.pivot.end_date && (
                                            <p className="text-xs text-gray-500">
                                                Kết thúc: {new Date(service.pivot.end_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                        
                                        {service.pivot.note && (
                                            <p className="text-sm text-gray-600 italic mt-2">{service.pivot.note}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingService(service);
                                            setEditData({
                                                price: service.pivot.price,
                                                is_active: service.pivot.is_active,
                                                note: service.pivot.note || '',
                                                start_date: service.pivot.start_date || '',
                                                end_date: service.pivot.end_date || '',
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service.pivot.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Chưa có dịch vụ nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thêm dịch vụ đầu tiên cho người thuê này</p>
                    </div>
                )}

                {/* ADD SERVICE MODAL */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm dịch vụ</h2>
                            <form onSubmit={handleAddService}>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Dịch vụ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.service_id}
                                        onChange={(e) => {
                                            const serviceId = e.target.value;
                                            const selectedService = allServices.find(s => s.id == serviceId);
                                            setData({
                                                ...data,
                                                service_id: serviceId,
                                                price: selectedService ? selectedService.default_price : ''
                                            });
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn dịch vụ</option>
                                        {availableServices.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} ({getUnitLabel(service.unit)})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Giá (₫) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày bắt đầu
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Ghi chú thêm..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Đang thêm...' : 'Thêm'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            reset();
                                        }}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT SERVICE MODAL */}
                {editingService && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chỉnh sửa dịch vụ</h2>
                            <form onSubmit={handleEditService}>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Dịch vụ
                                    </label>
                                    <input
                                        type="text"
                                        value={editingService.name}
                                        disabled
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Giá (₫) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editData.price}
                                        onChange={(e) => setEditData('price', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={editData.is_active}
                                            onChange={(e) => setEditData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Kích hoạt</span>
                                    </label>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày bắt đầu
                                    </label>
                                    <input
                                        type="date"
                                        value={editData.start_date}
                                        onChange={(e) => setEditData('start_date', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={editData.end_date}
                                        onChange={(e) => setEditData('end_date', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={editData.note}
                                        onChange={(e) => setEditData('note', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                                    >
                                        {editProcessing ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingService(null)}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
