import { Link, Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ auth, services = [], houses = [], rooms = [] }) {
    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canCreateService = isLandlord || userPerms.includes('services.create');
    const canEditService = isLandlord || userPerms.includes('services.edit');
    const canDeleteService = isLandlord || userPerms.includes('services.delete');

    const [activeTab, setActiveTab] = useState('house_services'); // house_services, catalog
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roomSearchTerm, setRoomSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

    const handleDelete = (serviceId) => {
        setConfirmDelete({ show: true, id: serviceId });
    };

    const executeDelete = () => {
        router.delete(route('landlord.services.destroy', confirmDelete.id), {
            onFinish: () => setConfirmDelete({ show: false, id: null }),
        });
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

    // Filter global catalog services
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter rooms for selected house
    const houseRooms = selectedHouse
        ? rooms.filter(r => r.house_id === selectedHouse.id)
        : [];

    const filteredRooms = houseRooms.filter(r =>
        r.name.toLowerCase().includes(roomSearchTerm.toLowerCase())
    );

    return (

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto font-sans">
            <Head title="Quản lý dịch vụ" />

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Quản lý dịch vụ</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý biểu giá dịch vụ chung và phân phối dịch vụ cho từng phòng trọ</p>
                </div>

                {canCreateService && (
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('landlord.services.create')}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tạo dịch vụ mới
                        </Link>
                    </div>
                )}
            </div>

            {/* TABS SELECTOR */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 mb-8 max-w-md">
                <button
                    onClick={() => {
                        setActiveTab('house_services');
                        setSelectedHouse(null);
                    }}
                    className={`flex-1 py-3 text-center rounded-xl text-sm font-extrabold transition-all ${activeTab === 'house_services'
                            ? 'bg-white text-emerald-700 shadow-md shadow-emerald-900/5'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    🏠 Theo Nhà trọ
                </button>
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex-1 py-3 text-center rounded-xl text-sm font-extrabold transition-all ${activeTab === 'catalog'
                            ? 'bg-white text-emerald-700 shadow-md shadow-emerald-900/5'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    📋 Danh mục dùng chung
                </button>
            </div>

            {/* --- TAB CONTENT: HOUSE SERVICES --- */}
            {activeTab === 'house_services' && (
                <>
                    {!selectedHouse ? (
                        houses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Bạn chưa quản lý nhà nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {houses.map((house) => (
                                    <div
                                        key={house.id}
                                        onClick={() => setSelectedHouse(house)}
                                        className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>

                                        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                            <div>
                                                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                                    {house.type === 'apartment' ? 'Chung cư' : house.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                                </span>
                                                <h3 className="text-xl font-extrabold text-teal-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                                    {house.name}
                                                </h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                        </p>

                                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Tổng số phòng:</span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                                                {house.rooms_count} phòng
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <>
                            {/* HOUSE DRILL-DOWN */}
                            <div className="mb-6">
                                <button
                                    onClick={() => {
                                        setSelectedHouse(null);
                                        setRoomSearchTerm('');
                                    }}
                                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors group"
                                >
                                    <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Quay lại danh sách nhà
                                </button>

                                <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                                    {selectedHouse.type === 'apartment' ? 'Chung cư' : selectedHouse.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-400 font-semibold">{houseRooms.length} phòng tổng cộng</span>
                                            </div>
                                            <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                                {selectedHouse.name}
                                            </h1>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {selectedHouse.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEARCH FOR ROOMS */}
                            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:w-72">
                                    <input
                                        type="text"
                                        placeholder="Tìm số phòng..."
                                        value={roomSearchTerm}
                                        onChange={(e) => setRoomSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all shadow-none"
                                    />
                                    <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>

                            {/* ROOMS & SERVICES LIST */}
                            {filteredRooms.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                                    <p className="text-gray-500 font-medium">Không tìm thấy phòng nào.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-bold text-teal-900">Phòng {room.name}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${room.status === 'occupied' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {room.status === 'occupied' ? 'Đang thuê' : 'Trống'}
                                                    </span>
                                                </div>

                                                <div className="h-px bg-gray-100 my-3"></div>

                                                <div className="space-y-1.5 mb-4">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dịch vụ đang dùng:</p>
                                                    {room.services && room.services.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {room.services.map((srv) => (
                                                                <span key={srv.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-100/50">
                                                                    {srv.name}: {new Intl.NumberFormat('vi-VN').format(srv.pivot.price)} ₫
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">Chưa gắn dịch vụ nào</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-50 mt-auto">
                                                <Link
                                                    href={route('landlord.rooms.services', room.id)}
                                                    className="block w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center rounded-xl text-xs font-bold border border-emerald-100/50 transition-colors"
                                                >
                                                    ⚙️ Cấu hình dịch vụ phòng
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* --- TAB CONTENT: CATALOG --- */}
            {activeTab === 'catalog' && (
                <>
                    {/* SEARCH BAR */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>

                    {/* SERVICES GRID */}
                    {filteredServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                >
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

                                        <div className="flex items-baseline gap-1 mt-4">
                                            <span className="text-2xl font-extrabold text-emerald-600">
                                                {new Intl.NumberFormat('vi-VN').format(service.default_price)}
                                            </span>
                                            <span className="text-sm text-gray-500">₫</span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                        {canEditService && (
                                            <Link
                                                href={route('landlord.services.edit', service.id)}
                                                className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                            >
                                                Sửa
                                            </Link>
                                        )}
                                        {canDeleteService && (
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Chưa có dịch vụ nào trong danh mục</p>
                        </div>
                    )}
                </>
            )}
            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null })}
                onConfirm={executeDelete}
                title="Xóa dịch vụ"
                message="Bạn có chắc chắn muốn xóa dịch vụ này?"
                confirmText="Xóa"
                type="danger"
            />
        </div>

    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;
