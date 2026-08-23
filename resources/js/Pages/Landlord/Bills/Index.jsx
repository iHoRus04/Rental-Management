import { Link, usePage, router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';
import AlertModal from '@/Components/AlertModal';

export default function Index() {
    const { bills = [], houses = [], auth } = usePage().props;

    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canCreateBill = isLandlord || userPerms.includes('bills.create');

    const [selectedHouse, setSelectedHouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, unpaid, paid, overdue

    const [showBankModal, setShowBankModal] = useState(false);
    const [bankNameInput, setBankNameInput] = useState('');
    const [accountNoInput, setAccountNoInput] = useState('');
    const [accountNameInput, setAccountNameInput] = useState('');
    const [savingBank, setSavingBank] = useState(false);
    const [confirmGenerate, setConfirmGenerate] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: 'Thông báo', message: '', type: 'warning' });

    const VIETNAM_BANKS = [
        { code: 'vietcombank', name: 'Vietcombank' },
        { code: 'techcombank', name: 'Techcombank' },
        { code: 'mbbank', name: 'MB Bank' },
        { code: 'bidv', name: 'BIDV' },
        { code: 'vietinbank', name: 'VietinBank' },
        { code: 'agribank', name: 'Agribank' },
        { code: 'vpbank', name: 'VPBank' },
        { code: 'acb', name: 'ACB' },
        { code: 'sacombank', name: 'Sacombank' },
        { code: 'tpbank', name: 'TPBank' },
        { code: 'shb', name: 'SHB' },
        { code: 'ocb', name: 'OCB' },
    ];

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ thanh toán', icon: '⏳' },
            partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Thanh toán 1 phần', icon: '🌗' },
            paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã thanh toán', icon: '✓' },
            overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Quá hạn', icon: '⚠️' },
        };
        const style = styles[status] || styles.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                <span>{style.icon}</span> {style.label}
            </span>
        );
    };

    const handleGenerateMonthly = () => {
        setConfirmGenerate(true);
    };

    const executeGenerateMonthly = () => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        router.post(route('landlord.bills.generateMonthly'), {
            month: currentMonth,
            year: currentYear
        });
        setConfirmGenerate(false);
    };

    // Calculate house statistics
    const getHouseStats = (houseId) => {
        const houseBills = bills.filter(b => b.room && b.room.house_id === houseId);
        const total = houseBills.length;
        const unpaid = houseBills.filter(b => b.status === 'pending' || b.status === 'partial').length;
        const paid = houseBills.filter(b => b.status === 'paid').length;
        const overdue = houseBills.filter(b => b.status === 'overdue').length;
        return { total, unpaid, paid, overdue };
    };

    // Filter logic for selected house
    const houseBills = selectedHouse
        ? bills.filter(b => b.room && b.room.house_id === selectedHouse.id)
        : [];

    const filteredBills = houseBills.filter(bill => {
        // Search term match
        const tenantName = bill.renter_request?.name || bill.renterRequest?.name || bill.contract?.renter_request?.name || bill.contract?.renterRequest?.name || '';
        const matchesSearch = bill.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenantName.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Status match
        if (statusFilter === 'unpaid' && bill.status !== 'pending' && bill.status !== 'partial') return false;
        if (statusFilter === 'paid' && bill.status !== 'paid') return false;
        if (statusFilter === 'overdue' && bill.status !== 'overdue') return false;

        return true;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Quản lý hóa đơn" />

            <div className="max-w-[1600px] mx-auto">

                {/* HOUSE LIST GRID VIEW */}
                {!selectedHouse ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Tài chính & Thanh toán
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">Quản lý hóa đơn</h1>
                                <p className="text-gray-500 mt-1 text-xs sm:text-sm">Chọn nhà trọ/căn hộ để quản lý, xem danh sách và thanh toán hóa đơn</p>
                            </div>

                            <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full md:w-auto">
                                <a
                                    href={route('landlord.bills.exportExcel')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-600 hover:text-white transition-all shadow-sm whitespace-nowrap"
                                    title="Tải về danh sách tất cả hóa đơn dạng file Excel / CSV"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Xuất Excel
                                </a>

                                {canCreateBill && (
                                    <>
                                        <button
                                            onClick={handleGenerateMonthly}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-emerald-100 text-emerald-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            Tạo tự động
                                        </button>
                                        <Link
                                            href={route('landlord.bills.create')}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Tạo hóa đơn
                                        </Link>
                                    </>
                                )}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {houses.map((house) => {
                                    const { total, unpaid, paid, overdue } = getHouseStats(house.id);

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
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 grid grid-cols-3 gap-2 text-center relative z-10">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Chờ thu</p>
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 mt-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                        {unpaid} hóa đơn
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Quá hạn</p>
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 mt-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                                        {overdue} hóa đơn
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Đã thu</p>
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 mt-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                        {paid} hóa đơn
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* BACK BUTTON & HOUSE DETAIL HEADER */}
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setSelectedHouse(null);
                                    setSearchTerm('');
                                    setStatusFilter('all');
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
                                            <span className="text-xs text-gray-400 font-semibold">{houseBills.length} hóa đơn tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                    </div>

                                    {canCreateBill && (
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => {
                                                    setBankNameInput(selectedHouse.bank_name || '');
                                                    setAccountNoInput(selectedHouse.account_no || '');
                                                    setAccountNameInput(selectedHouse.account_name || '');
                                                    setShowBankModal(true);
                                                }}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-teal-100 text-teal-700 rounded-xl font-bold text-xs hover:bg-teal-50 hover:border-teal-200 transition-all shadow-sm"
                                            >
                                                ⚙️ Cấu hình ngân hàng
                                            </button>
                                            <button
                                                onClick={handleGenerateMonthly}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                                            >
                                                Tạo tự động
                                            </button>
                                            <Link
                                                href={route('landlord.bills.create')}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                            >
                                                Tạo hóa đơn
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DRILL-DOWN FILTERS */}
                        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Tabs */}
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-full md:w-auto overflow-x-auto">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'all'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Tất cả ({houseBills.length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('unpaid')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'unpaid'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Chờ thanh toán ({houseBills.filter(b => b.status === 'pending' || b.status === 'partial').length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('overdue')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'overdue'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Quá hạn ({houseBills.filter(b => b.status === 'overdue').length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('paid')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'paid'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Đã thanh toán ({houseBills.filter(b => b.status === 'paid').length})
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Tìm số phòng hoặc người thuê..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all shadow-none"
                                />
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* DRILL-DOWN BILLS GRID */}
                        {filteredBills.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Không tìm thấy hóa đơn nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBills.map((bill) => (
                                    <div
                                        key={bill.id}
                                        className={`group bg-white rounded-[20px] p-6 shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${bill.status === 'overdue' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 hover:border-emerald-200'
                                            }`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {bill.room.name.toLowerCase().startsWith('phòng') ? bill.room.name : `Phòng ${bill.room.name}`}
                                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                        T{bill.month}/{bill.year}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    {bill.renter_request?.name || bill.renterRequest?.name || bill.contract?.renter_request?.name || bill.contract?.renterRequest?.name || 'Chưa có tên'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xl font-extrabold ${bill.status === 'paid' ? 'text-emerald-600' : 'text-teal-900'}`}>
                                                    {Math.floor(bill.amount).toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar (Paid Amount) */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-medium mb-1">
                                                <span className="text-gray-500">Đã thanh toán</span>
                                                <span className={bill.paid_amount >= bill.amount ? 'text-emerald-600' : 'text-gray-700'}>
                                                    {bill.paid_amount.toLocaleString('vi-VN')}₫
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${bill.status === 'paid' ? 'bg-emerald-500' :
                                                        bill.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-400'
                                                        }`}
                                                    style={{ width: `${Math.min((bill.paid_amount / bill.amount) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Footer Info & Actions */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex flex-col gap-1">
                                                {getStatusBadge(bill.status)}
                                                <span className="text-[10px] text-gray-400 font-medium">Hạn: {new Date(bill.due_date).toLocaleDateString('vi-VN')}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('landlord.bills.show', bill.id)}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                                >
                                                    Chi tiết
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Thiết lập tài khoản ngân hàng */}
            {showBankModal && selectedHouse && (
                <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-xl max-w-md w-full border border-gray-100 p-6 relative overflow-hidden">
                        <button
                            onClick={() => setShowBankModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 font-bold text-lg p-1.5 transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-extrabold text-teal-900 mb-2 flex items-center gap-2">
                            <span>⚙️</span> Thiết lập tài khoản VietQR
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Cấu hình tài khoản ngân hàng nhận tiền cho nhà trọ <strong>{selectedHouse.name}</strong>.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ngân hàng</label>
                                <select
                                    value={bankNameInput}
                                    onChange={e => setBankNameInput(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-700 text-xs cursor-pointer bg-white"
                                >
                                    <option value="">-- Chọn ngân hàng nhận tiền --</option>
                                    {VIETNAM_BANKS.map(bank => (
                                        <option key={bank.code} value={bank.code}>{bank.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNoInput}
                                    onChange={e => setAccountNoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-850 text-xs"
                                    placeholder="Số tài khoản ngân hàng"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNameInput}
                                    onChange={e => setAccountNameInput(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-semibold text-gray-850 text-xs"
                                    placeholder="VIET GIAY HOA HOAC IN HOA"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowBankModal(false)}
                                disabled={savingBank}
                                className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    if (!bankNameInput || !accountNoInput || !accountNameInput) {
                                        setAlertModal({ show: true, title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng!', type: 'warning' });
                                        return;
                                    }
                                    setSavingBank(true);
                                    router.put(route('landlord.houses.update-utility-prices', selectedHouse.id), {
                                        electric_price: selectedHouse.electric_price || 0,
                                        water_price: selectedHouse.water_price || 0,
                                        bank_name: bankNameInput,
                                        account_no: accountNoInput,
                                        account_name: accountNameInput,
                                    }, {
                                        onSuccess: (page) => {
                                            setSavingBank(false);
                                            setShowBankModal(false);
                                            // Update details locally so the UI updates
                                            const updatedHouse = page.props.houses.find(h => h.id === selectedHouse.id);
                                            if (updatedHouse) {
                                                setSelectedHouse(updatedHouse);
                                            }
                                        },
                                        onError: () => {
                                            setSavingBank(false);
                                        }
                                    });
                                }}
                                disabled={savingBank}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                {savingBank ? 'Đang lưu...' : 'Lưu tài khoản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={confirmGenerate}
                onClose={() => setConfirmGenerate(false)}
                onConfirm={executeGenerateMonthly}
                title="Tạo hóa đơn tự động"
                message={`Bạn có chắc chắn muốn tạo hóa đơn tự động cho tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}?`}
                confirmText="Tạo ngay"
                type="info"
            />

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;