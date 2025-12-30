import { Link, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { room, contracts } = usePage().props;

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đang hiệu lực', dot: 'bg-emerald-500' },
            terminated: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Đã chấm dứt', dot: 'bg-rose-500' },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Hết hạn', dot: 'bg-gray-500' },
        };
        const style = config[status] || config.expired;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                {style.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Hợp đồng - ${room.name}`} />
            
            <div className="max-w-[1200px] mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="mb-2">
                            <Link
                                href={route('landlord.houses.rooms.show', [room.house.id, room.id])}
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại chi tiết phòng
                            </Link>
                        </div>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight flex items-center gap-2">
                            Hợp đồng thuê
                            <span className="text-emerald-600">#{room.name}</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{room.house.name}</p>
                    </div>

                    <Link
                        href={route('landlord.rooms.contracts.create', room.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tạo hợp đồng mới
                    </Link>
                </div>

                {/* --- CONTRACTS LIST --- */}
                {contracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium mb-4">Chưa có hợp đồng nào cho phòng này</p>
                     
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {contracts.map((contract) => (
                            <div 
                                key={contract.id} 
                                className="group bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Status Indicator Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${contract.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>

                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pl-2">
                                    {/* Left: Tenant Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                                            {contract.renterRequest?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                                                {contract.renterRequest?.name || 'Không xác định'}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {contract.renterRequest?.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle: Contract Details */}
                                    <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Thời hạn</p>
                                            <div className="flex items-center gap-2 font-medium text-gray-700">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(contract.start_date).toLocaleDateString('vi-VN')} 
                                                <span className="text-gray-400">→</span> 
                                                {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Giá thuê</p>
                                            <p className="font-bold text-emerald-600 text-base">
                                                {contract.monthly_rent.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tiền cọc</p>
                                            <p className="font-medium text-gray-700">
                                                {contract.deposit.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₫
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Status & Action */}
                                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-none border-gray-50 pt-4 lg:pt-0 mt-2 lg:mt-0">
                                        {getStatusBadge(contract.status)}
                                        
                                        <Link
                                            href={route('landlord.rooms.contracts.show', [room.id, contract.id])}
                                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            Chi tiết
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;