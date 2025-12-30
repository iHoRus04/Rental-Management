import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- UTILS ---
const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

// --- MODERN FRESH GREEN COMPONENTS ---

// 1. Stat Card - Bento Grid Style (Green Theme)
const BentoStatCard = ({ title, value, subValue, icon, type, href }) => {
    // Styles cập nhật theo tông xanh tươi
    const styles = {
        primary: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
        secondary: "bg-white text-gray-800 border border-gray-100/80 hover:border-emerald-200",
        glass: "bg-white/70 backdrop-blur-xl border border-white/60 text-gray-800 hover:border-emerald-200"
    }[type] || "bg-white text-gray-800";

    const content = (
        <div className={`relative h-full rounded-[24px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${styles} group overflow-hidden`}>
            {/* Background Decor for Primary - Green blobs */}
            {type === 'primary' && (
                <>
                    <div className="absolute top-[-50%] right-[-20%] w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] left-[-20%] w-32 h-32 bg-teal-300/20 rounded-full blur-2xl"></div>
                </>
            )}
            
            <div className="flex justify-between items-start z-10">
                {/* Icon background updated */}
                <div className={`p-3.5 rounded-[18px] ${type === 'primary' ? 'bg-white/25 backdrop-blur-md shadow-inner-sm' : 'bg-emerald-50 text-emerald-600'}`}>
                    {icon}
                </div>
                {type !== 'primary' && (
                    <div className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                )}
            </div>

            <div className="z-10 mt-6">
                <p className={`text-sm font-semibold mb-2 ${type === 'primary' ? 'text-emerald-50' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-3xl font-extrabold tracking-tight leading-none">{value}</h3>
                {subValue && (
                    <div className={`flex items-center gap-1 text-xs font-bold mt-3 ${type === 'primary' ? 'text-white/90' : 'text-gray-500'}`}>
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
    return href ? <Link href={href} className="block h-full">{content}</Link> : content;
};

// 2. Unit Card - Fresh Green Minimalist
const ModernUnitCard = ({ contract }) => {
    const imageUrl = useMemo(() => {
        try {
            const images = JSON.parse(contract.room?.images);
            return images && images.length > 0 ? `/storage/${images[0]}` : null;
        } catch (e) { return null; }
    }, [contract.room?.images]);

    const isOccupied = contract.room?.status === 'occupied';

    return (
        <Link 
            href={route('landlord.houses.rooms.show', [contract.room?.house?.id, contract.room?.id])}
            // Hover border changed to emerald
            className="group relative bg-white rounded-[24px] p-3 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:bg-emerald-50/30 border border-gray-100/50 hover:border-emerald-200"
        >
            <div className="flex gap-4">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-[20px] overflow-hidden bg-gray-100 shadow-sm">
                    {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                    {/* Status Dot - Vibrant Green */}
                    <div className={`absolute top-3 left-3 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-md ${isOccupied ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                </div>

                <div className="flex-grow flex flex-col justify-center py-1 pr-2">
                    <div className="mb-1">
                        {/* Title hover color changed to emerald */}
                        <h4 className="font-bold text-gray-900 text-[17px] group-hover:text-emerald-600 transition-colors line-clamp-1">{contract.room?.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs font-medium">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <p className="line-clamp-1">{contract.room?.house?.address}</p>
                        </div>
                    </div>
                    
                    <div className="mt-auto">
                        <div className="flex justify-between items-end items-center">
                             <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                                <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2.5 py-1.5 rounded-xl shadow-sm group-hover:border-emerald-100 transition-all">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="max-w-[80px] truncate">{contract.renterRequest?.name || '---'}</span>
                                </div>
                            </div>
                            {/* Price tag changed to emerald theme */}
                            <span className="text-emerald-700 font-extrabold text-sm bg-emerald-50/80 px-3 py-1.5 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                {formatCurrency(contract.monthly_rent)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// 3. Circular Progress (Donut Chart) - Green Theme
const CircleProgress = ({ percentage, colorClass, label, value }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Default color is emerald if not specified
    const finalColorClass = colorClass || "text-emerald-500";

    return (
        <div className="flex items-center justify-between p-5 bg-white border border-gray-100/80 rounded-[20px] mb-4 last:mb-0 hover:border-emerald-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex flex-col">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5 group-hover:text-emerald-600 transition-colors">{label}</span>
                {/* Value color updated to dark teal */}
                <span className="text-2xl font-extrabold text-teal-900 leading-none">{value}</span>
            </div>
            <div className="relative w-[76px] h-[76px] transform -rotate-90">
                <svg className="w-full h-full drop-shadow-sm">
                    <circle className="text-gray-100" strokeWidth="7" stroke="currentColor" fill="transparent" r={radius} cx="38" cy="38" />
                    <circle 
                        className={`${finalColorClass} transition-all duration-1000 ease-out`} 
                        strokeWidth="7" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r={radius} 
                        cx="38" 
                        cy="38" 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
                    <span className={`text-sm font-extrabold ${finalColorClass}`}>{percentage}%</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD ---

export default function Dashboard() {
    const { stats, contracts: initialContracts } = usePage().props;
    const [contracts, setContracts] = useState(initialContracts?.data || initialContracts || []);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialContracts?.next_page_url != null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const observerRef = useRef();

    const filteredContracts = useMemo(() => {
        if (!searchTerm) return contracts;
        const search = searchTerm.toLowerCase();
        return contracts.filter(c => 
            c.room?.name?.toLowerCase().includes(search) ||
            c.renterRequest?.name?.toLowerCase().includes(search) ||
            c.room?.house?.address?.toLowerCase().includes(search)
        );
    }, [contracts, searchTerm]);

    const loadMoreContracts = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const response = await fetch(route('landlord.dashboard') + `?page=${page + 1}`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            const data = await response.json();
            if (data.contracts?.data?.length > 0) {
                setContracts(prev => [...prev, ...data.contracts.data]);
                setPage(prev => prev + 1);
                setHasMore(data.contracts.next_page_url != null);
            } else { setHasMore(false); }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) loadMoreContracts();
        }, { threshold: 0.1 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observerRef.current && observer.unobserve(observerRef.current);
    }, [hasMore, loading, page]);

    return (
        <AuthenticatedLayout>
            {/* Background Layer - Fresh Green Tint */}
            <div className="min-h-screen bg-emerald-50/40 font-sans relative overflow-hidden pb-20">
                {/* Abstract Blobs updated to Green/Teal */}
                <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-400 opacity-[0.04] rounded-full blur-[130px] pointer-events-none mix-blend-multiply"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-400 opacity-[0.05] rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

                <div className="relative max-w-[1800px] mx-auto px-4 md:px-8 pt-10">
                    
                    {/* Header - Dark Teal text */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <p className="text-emerald-700/70 font-semibold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Tổng quan hệ thống
                            </p>
                            <h1 className="text-4xl font-extrabold text-teal-900 tracking-tight">Dashboard</h1>
                        </div>
                     
                    </div>

                    {/* BENTO GRID LAYOUT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        
                        {/* 1. Main Stats (Col 1) - Primary Green Card */}
                        <div className="lg:col-span-1 h-52 lg:h-auto">
                            <BentoStatCard 
                                type="primary"
                                title="Doanh thu tháng này"
                                value={formatCurrency(stats?.monthlyRevenue || 0)}
                                subValue={stats?.revenueChangePercent ? (
                                    <span className="flex items-center gap-1">
                                        <span className="bg-white/20 rounded p-0.5">{stats.revenueChangeIsPositive ? '↗' : '↘'}</span> 
                                        {stats.revenueChangePercent}% so với tháng trước
                                    </span>
                                ) : null}
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                href={route('landlord.bills.index')}
                            />
                        </div>

                        {/* 2. Secondary Stats - Icons updated to green */}
                        <BentoStatCard 
                            type="secondary"
                            title="Chưa thanh toán"
                            value={formatCurrency(stats?.pendingAmount || 0)}
                         
                            subValue={<span className="text-red-600 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Cần thu gấp</span>}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            href={route('landlord.bills.index')}
                        />
                         <BentoStatCard 
                            type="secondary"
                            title="Phòng đang thuê"
                            value={`${stats?.occupiedRooms || 0}`}
                            subValue={<span className="text-gray-500 font-medium">Tổng: <strong>{stats?.totalRooms}</strong> phòng</span>}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                            href={route('landlord.houses.index')}
                        />
                         <BentoStatCard 
                            type="glass"
                            title="Yêu cầu mới"
                            value={`${stats?.newRenterRequests || 0}`}
                            subValue={<span className="text-emerald-600 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Đang chờ duyệt</span>}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                            href={route('landlord.renter-requests.index')}
                        
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-full">
                        {/* CHART SECTION */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-gray-100/80 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-8">
                                {/* Title color updated */}
                                <h3 className="text-xl font-extrabold text-teal-900">Biểu đồ doanh thu</h3>
                                <Link 
                                    href={route('landlord.bills.index')}
                                    // Button color updated to emerald
                                    className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                            
                            {/* Stylized Chart Bars - Green Gradient */}
                            <div className="relative flex-grow w-full flex items-end justify-between px-2 gap-4 h-64">
                                {(stats?.revenueChart || []).map((data, idx) => {
                                    const maxRev = Math.max(...(stats?.revenueChart?.map(d => d.revenue) || [1]));
                                    const h = (data.revenue / maxRev) * 100;
                                    
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full cursor-pointer">
                                            <div className="mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-teal-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg absolute -mt-10 whitespace-nowrap z-20 shadow-lg transform group-hover:-translate-y-1">
                                                {formatCurrency(data.revenue)}
                                            </div>
                                            
                                            <div className="w-full max-w-[48px] bg-gray-50 rounded-[14px] relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-gray-100" style={{height: `${h}%`}}>
                                                {/* Bar gradient updated to emerald/teal */}
                                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 via-teal-400 to-teal-300 rounded-[14px] transition-all duration-1000 ease-out opacity-90 group-hover:opacity-100" style={{height: '70%'}}></div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold mt-4 group-hover:text-emerald-600 transition-colors">{data.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* STATS WHEEL SECTION (Donut Charts) */}
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-gray-100/80 flex flex-col justify-center">
                            <h3 className="text-xl font-extrabold text-teal-900 mb-8">Trạng thái phòng</h3>
                            <div className="flex-grow flex flex-col justify-center space-y-3">
                                <CircleProgress 
                                    label="Hiệu suất lấp đầy" 
                                    value={stats?.occupiedRooms || 0}
                                    percentage={stats?.totalRooms ? Math.round((stats.occupiedRooms/stats.totalRooms)*100) : 0} 
                                    // Default is emerald
                                />
                                <CircleProgress 
                                    label="Phòng Trống" 
                                    value={stats?.vacantRooms || 0}
                                    percentage={stats?.totalRooms ? Math.round((stats.vacantRooms/stats.totalRooms)*100) : 0} 
                                    colorClass="text-amber-400" // Accent color for vacant
                                />
                                <CircleProgress 
                                    label="Hóa đơn nợ" 
                                    value={stats?.unpaidBills || 0}
                                    percentage={stats?.activeContracts ? Math.round((stats.unpaidBills/stats.activeContracts)*100) : 0} 
                                    colorClass="text-rose-500" // Accent color for debt
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIST SECTION */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] border border-white/60">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                            <h2 className="text-2xl font-extrabold text-teal-900">Danh sách phòng</h2>
                            <div className="flex w-full md:w-auto gap-3">
                                <div className="relative flex-grow">
                                    {/* Input focus ring changed to emerald */}
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm nhanh..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white border-gray-100 shadow-sm rounded-full px-5 py-3 w-full md:w-72 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 font-medium text-gray-700"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <Link 
                                    href={route('landlord.houses.index')}
                                    // Button gradient changed to emerald/teal
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Thêm mới
                                </Link>
                            </div>
                        </div>

                        {filteredContracts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredContracts.map(contract => (
                                    <ModernUnitCard key={contract.id} contract={contract} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h4 className="text-lg font-bold text-gray-700 mb-2">Chưa có dữ liệu</h4>
                                <p className="text-gray-500 font-medium">Không tìm thấy phòng nào phù hợp với tiêu chí của bạn.</p>
                            </div>
                        )}

                        {hasMore && (
                            <div ref={observerRef} className="mt-10 flex justify-center pb-6">
                                {/* Spinner color changed to emerald */}
                                {loading && <div className="w-12 h-12 border-[5px] border-emerald-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}