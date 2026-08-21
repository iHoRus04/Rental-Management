import { Link, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

// --- UTILS ---
const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Index() {
    const { payments = [], houses = [] } = usePage().props;
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getMethodBadge = (method) => {
        const styles = {
            cash: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tiền mặt', icon: '💵' },
            bank_transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Chuyển khoản', icon: '🏦' },
            check: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Séc', icon: '🎫' },
            other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Khác', icon: '🔹' },
        };
        const style = styles[method] || styles.other;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}>
                <span>{style.icon}</span> {style.label}
            </span>
        );
    };

    // Lọc theo tháng năm 
    const [month, setMonth] = useState('all');
    const [year, setYear] = useState(new Date().getFullYear());

    // Calculate house statistics
    const getHouseStats = (houseId) => {
        const housePayments = payments.filter(p => p.bill && p.bill.room && p.bill.room.house_id === houseId);
        const total = housePayments.length;
        const totalRevenue = housePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        return { total, totalRevenue };
    };

    // Filter logic for selected house
    const housePayments = selectedHouse
        ? payments.filter(p => p.bill && p.bill.room && p.bill.room.house_id === selectedHouse.id)
        : [];

    const filteredPayments = housePayments.filter(p => {
        const matchesSearch =
            (p.bill?.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.bill?.renter_request?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMonth = month === 'all' || Number(p.bill?.month) === Number(month);
        const matchesYear = year === 'all' || Number(p.bill?.year) === Number(year);

        return matchesSearch && matchesMonth && matchesYear;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Lịch sử thanh toán" />

            <div className="max-w-[1600px] mx-auto">

                {/* HOUSE LIST GRID VIEW */}
                {!selectedHouse ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Tài chính & Doanh thu
                                </p>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Lịch sử thanh toán</h1>
                                <p className="text-gray-500 mt-1 text-sm">Chọn nhà trọ/căn hộ để xem lịch sử giao dịch và thống kê tiền đã thu</p>
                            </div>


                        </div>

                        {houses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Bạn chưa quản lý nhà nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {houses.map((house) => {
                                    const { total, totalRevenue } = getHouseStats(house.id);

                                    return (
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
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                                <div>
                                                    <span className="text-xs text-gray-400 font-bold uppercase block">Doanh thu thu được:</span>
                                                    <span className="text-lg font-black text-emerald-600 block mt-0.5">
                                                        {formatCurrency(totalRevenue)}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                                                    {total} giao dịch
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* DRILL-DOWN HEADER */}
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setSelectedHouse(null);
                                    setSearchTerm('');
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
                                            <span className="text-xs text-gray-400 font-semibold">{housePayments.length} giao dịch tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                    </div>

                                    <Link
                                        href={route('landlord.payments.create')}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Ghi nhận thanh toán
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* SEARCH CONTROLS */}
                        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Tìm theo số phòng, người thuê..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all shadow-none"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>


                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lọc kỳ hóa đơn:</span>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="all">Tất cả các tháng</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                    ))}
                                </select>

                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="all">Tất cả các năm</option>
                                    {[...Array(8)].map((_, i) => {
                                        const y = new Date().getFullYear() - i + 1;
                                        return <option key={y} value={y}>Năm {y}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* PAYMENTS GRID */}
                        {filteredPayments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Chưa có giao dịch nào ở nhà này.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="group bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                                    >
                                        {/* Top Info */}
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 text-lg"> {payment.bill.room.name}</h3>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                        T{payment.bill.month}/{payment.bill.year}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    {payment.bill.renter_request?.name || 'Không xác định'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-extrabold text-emerald-600">
                                                    +{formatCurrency(payment.amount)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-gray-100 my-4 relative z-10"></div>

                                        {/* Bottom Info */}
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex flex-col gap-1">
                                                {getMethodBadge(payment.payment_method)}
                                                <span className="text-[10px] text-gray-400 font-medium ml-1">
                                                    {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>

                                            <Link
                                                href={route('landlord.payments.show', payment.id)}
                                                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                            >
                                                Chi tiết
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </Link>
                                        </div>

                                        {/* Background Decoration */}
                                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 z-0 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;