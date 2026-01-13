import { Link, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Index({ auth, services }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (serviceId) => {
        if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            router.delete(route('landlord.services.destroy', serviceId));
        }
    };

    const getUnitLabel = (unit) => {
        const units = {
            'kwh': 'kWh (Điện)',
            'm3': 'm³ (Nước)',
            'month': 'Tháng',
            'service': 'Dịch vụ'
        };
        return units[unit] || unit;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans">
                <Head title="Quản lý dịch vụ" />

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Quản lý dịch vụ</h1>
                        <p className="text-emerald-600/80 font-medium text-sm mt-1">Danh sách các dịch vụ cho phòng trọ</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('landlord.services.create')}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Thêm dịch vụ
                        </Link>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* SERVICES GRID */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.map((service) => (
                            <div 
                                key={service.id} 
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                {/* Card Content */}
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h3>
                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                                {getUnitLabel(service.unit)}
                                            </span>
                                        </div>
                                        
                                        {service.is_active ? (
                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    {service.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                                    )}

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-extrabold text-emerald-600">
                                            {new Intl.NumberFormat('vi-VN').format(service.default_price)}
                                        </span>
                                        <span className="text-sm text-gray-500">₫</span>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    <Link
                                        href={route('landlord.services.edit', service.id)}
                                        className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Sửa
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Chưa có dịch vụ nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thêm dịch vụ đầu tiên để bắt đầu</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
